/**
 * redux-spring
 * Copyright (c) 2020 Sampson Li (lichun) <740056710@qq.com>
 * @license MIT
 */
import {combineReducers, Store} from 'redux';
import {useState, useEffect} from 'react';
import {assign, isGenerator} from "./util";

let _store: Store;
let _asyncReducers = {};

/**
 * 注入模块对应的reducer
 * @param {string} key
 * @param {function} reducer
 */
function injectReducer(key: string, reducer) {
    if (_store) {
        _asyncReducers[key] = reducer;
        _store.replaceReducer(combineReducers({
            ..._asyncReducers,
        }));
    } else {
        throw new Error('redux-spring is not initialized, please invoke "spring(store)" before!');
    }
}
// 保存所有模块的原型
const allProto = {};
// 保存所有模块的static属性, 方便开发模式热更新静态数据保留
const allStatic = {};


/**
 * 创建模块
 * @param {string} ns -- 模块名称， 模块名称唯一， 不能有冲突
 */
export function service(ns: string) {
    return function <T extends Model, K extends {new ():T, ns?: string}>(Clazz: K): K {
        if (!ns) {
            throw new Error("please define 'ns' before");
        }
        const TYPE = `spring/${ns}`;
        const instance = new Clazz();
        const __wired = Clazz.prototype.__wired || {};
        const wiredList = Object.keys(__wired);
        delete Clazz.prototype.__wired;

        function doUpdate(newState) {
            const keys = Object.keys(newState);
            const rootState = _store.getState();
            const oldState = rootState[ns];
            const diff = keys.some(key => newState[key] !== oldState[key]) || wiredList.some(key => newState[key] !== rootState[__wired[key]]);
            if (diff) {
                wiredList.forEach(key => {
                    newState[key] = rootState[__wired[key]];
                });
                _store.dispatch({type: TYPE, payload: newState});
            }
        }

        // 给外面用的原型实例
        const prototype = {setData: undefined, reset:undefined, created: undefined};

        // 给内部用的原型实例
        const _prototype = {setData: undefined, reset: undefined};

        Object.getOwnPropertyNames(Clazz.prototype).forEach(key => {
            if (key !== 'constructor' && typeof Clazz.prototype[key] === 'function') {
                const origin = Clazz.prototype[key];
                const isGen = isGenerator(origin); // 是否是generator方法
                prototype[key] = function (...params) {
                    const _this = Object.create(_prototype);
                    if (isGen) { // 如果当前方法是generator方法
                        const runGen = (ge, val, isError, e) => {
                            const rootState = _store.getState();
                            const state = rootState[ns];
                            Object.keys(state).forEach((_key) => {
                                if (__wired[_key]) {
                                    _this[_key] = rootState[__wired[_key]];
                                } else {
                                    _this[_key] = state[_key];
                                }
                            });
                            let tmp;
                            try {
                                if (isError) {
                                    tmp = ge.throw(e);
                                } else {
                                    tmp = ge.next(val);
                                }
                            } catch (error) {
                                doUpdate(_this);
                                ge.throw(error);
                            }
                            doUpdate(_this);
                            if (tmp.done) {
                                return tmp.value;
                            }
                            if (tmp.value && tmp.value.then) {
                                return tmp.value.then(data => runGen(ge, data, false, null)).catch(error => runGen(ge, null, true, error));
                            }
                            return runGen(ge, tmp.value, false, null);
                        };
                        // 异步方法必须异步执行
                        return  Promise.resolve().then(() => runGen(origin.bind(_this)(...params), null, false, null));
                    }
                    const rootState = _store.getState();
                    const state = rootState[ns];
                    Object.keys(state).forEach(_key => {
                        if (__wired[_key]) { // 更新注入的模块实例
                            _this[_key] = rootState[__wired[_key]];
                        } else {
                            _this[_key] = state[_key];
                        }
                    });
                    const result = origin.bind(_this)(...params);
                    if (result && typeof result.then === 'function') { // 如果返回来的是promise, 对数据进行同步， 此处可以兼容大部分async/await方法
                        doUpdate(_this);
                        return result.then(data => {
                            doUpdate(_this);
                            return data;
                        });
                    }
                    doUpdate(_this);
                    return result;
                };
                if (isGen) { // 解决异步方法嵌套调用问题
                    _prototype[key] = prototype[key];
                } else {
                    _prototype[key] = origin;
                }
            }
        });

        /**
         * 设置模块数据
         * @param props， 要设置属性的集合， 为普通对象，比如 {a: 1, b:2}, 代表设置模块中a属性为1， b属性为2
         */
        prototype.setData = function (props: Object) {
            const state = _store.getState()[ns];
            const keys = Object.keys(props);
            if (keys.some(key => props[key] !== state[key])) {
                _store.dispatch({type: TYPE, payload: {...state, ...props}});
            }
        };
        _prototype.setData = prototype.setData; // 模块内部也支持 调用setData方法

        const initState = Object.create(prototype);

        /**
         * 重置模块数据到初始状态， 一般用于组件销毁的时候调用
         */
        prototype.reset = function () {
            wiredList.forEach(key => {
                initState[key] = rootState[__wired[key]];
            })
            _store.dispatch({type: TYPE, payload: initState});
        };
        _prototype.reset = prototype.reset;
        const rootState = _store.getState() || {};
        const finalInstance = rootState[ns] ? rootState[ns] : instance;
        Object.getOwnPropertyNames(instance).forEach(key => {
            initState[key] = finalInstance[key];
        });
        wiredList.forEach(key => {
            initState[key] = rootState[__wired[key]];
        });
        if(rootState[ns]) { // 热更新时候用得到
            rootState[ns] = initState;
        }
        const reducer = (state = initState, {type, payload}) => {
            if (type === TYPE) {
                const result = Object.create(prototype);
                assign(result, payload);
                return result;
            }
            return state;
        };
        injectReducer(ns, reducer);

        const isHotReload = !!allProto[ns];

        /**
         * 开发模式 static数据保存和恢复
         */
        if(!isHotReload) {
            allStatic[ns] = assign({}, Clazz);
        } else {
            assign(Clazz, allStatic[ns]);
        }

        // 初始化提供created 方法调用, 热更新不重复调用
        if(typeof prototype.created === 'function' && !isHotReload) {
            prototype.created();
        }
        allProto[ns] = prototype;
        Clazz.ns = ns;
        assign(Clazz.prototype, prototype); // 覆盖初始原型对象
        return Clazz;
    };
}

/**
 * react hooks 方式获取模块类实例
 * @param Class 模块类
 */
export const useModel = <T extends Model>(Class: { new(): T, ns: string }): T => {
    const ns = Class.ns;
    const [data, setData] = useState(() => _store.getState()[ns]);
    useEffect(() => _store.subscribe(() => {
        const ret = _store.getState()[ns];
        if(data !== ret) {
            setData(ret);
        }
    }), []);

    return data;
};
/**
 * 按照类型自动注入Model实例
 * @param {Model} Class --模块类
 */
export function inject<T extends Model>(Class: { new(): T, ns: string }) {
    const ns = Class.ns;
    return (clazz, attr) => {
        if (!clazz.__wired) {
            clazz.__wired = {};
        }
        clazz.__wired[attr] = ns;
    };
}

/**
 * 按照模块名自动注入Model实例
 * @param {string} ns --模块名称
 */
export function resource(ns: string) {
    return (clazz, attr) => {
        if (!clazz.__wired) {
            clazz.__wired = {};
        }
        clazz.__wired[attr] = ns;
    };
}

/**
 * 模块基类，每个模块都应继承该基础模块类
 */
export class Model {
    static ns = '';

    /**
     * 批量设置模块数据
     * @param {Object} data - key-value 对象
     */
    setData<T>(this: T, data: {[p in {[c in keyof T]: T[c] extends Function ? never : c}[keyof T]]?: T[p]}) {
        return;
    }

    /**
     * 重置模块数据到初始默认值
     */
    reset() {
        return;
    }
}

/**
 * 转换generator类型到promise类型， 如果主项目使用ts开发， 可以通过此方法可以转换到Promise类型避免ts类型提示错误
 * @param gen 被转换的generator类型
 */
export const convert = <T>(gen:  Generator<unknown, T, unknown>): Promise<T> => {
    return <any>gen;
}

/**
 * 初始化redux-spring
 * @param {Store} store --需要注入的store
 * @param asyncReducers --兼容老reducer集合
 * @return {Store}
 */
export default <T extends Store>(store: T, asyncReducers = {}): T  => {
    _store = store;
    _asyncReducers = asyncReducers;
    return store;
};
