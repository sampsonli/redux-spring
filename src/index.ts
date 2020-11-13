import {combineReducers} from 'redux';
import {useState, useEffect} from 'react';

declare var Promise
let _store;
let _asyncReducers = {};

function injectReducer(key, reducer) {
    if (_store) {
        _asyncReducers[key] = reducer;
        _store.replaceReducer(combineReducers({
            ..._asyncReducers,
        }));
    } else {
        throw new Error('spring is not initialized, please invoke "spring(store)" before');
    }
}

const allProto = {};

function assign(target, from) {
    // @ts-ignore
    if (Object.assgin) return Object.assign(...arguments);
    const to = Object(target);
    for (let index = 1; index < arguments.length; index++) {
        const nextSource = arguments[index];

        if (nextSource !== null && nextSource !== undefined) {
            for (const nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
}

/**
 * 创建模块
 * @param ns 模块名称， 模块名称唯一， 不能有冲突
 */
export function service(ns: string) {
    return (Clazz) => {
        if (!ns) {
            throw new Error("please define 'ns' before");
        }
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
                })
                _store.dispatch({type: `spring/${ns}`, payload: newState});
            }
        }

        const prototype = {ns, setData: undefined, reset:undefined};
        const _prototype = {ns, setData: undefined, reset:undefined};
        Object.getOwnPropertyNames(Clazz.prototype).forEach(key => {
            if (key !== 'constructor' && typeof Clazz.prototype[key] === 'function') {
                const origin = Clazz.prototype[key];
                prototype[key] = function (...params) {
                    const _this = Object.create(_prototype);
                    if (origin.prototype.toString() === '[object Generator]') {
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
                        return Promise.resolve().then(() => runGen(origin.bind(_this)(...params), null, false, null));
                    }
                    const rootState = _store.getState();
                    const state = rootState[ns];
                    Object.keys(state).forEach(_key => {
                        if (__wired[_key]) {
                            _this[_key] = rootState[__wired[_key]];
                        } else {
                            _this[_key] = state[_key];
                        }
                    });
                    const result = origin.bind(_this)(...params);
                    if (result && typeof result.then === 'function') {
                        doUpdate(_this);
                        return result.then(data => {
                            doUpdate(_this);
                            return data;
                        });
                    }
                    doUpdate(_this);
                    return result;
                };
                if (origin.prototype.toString() === '[object Generator]') {
                    _prototype[key] = prototype[key];
                } else {
                    _prototype[key] = Clazz.prototype[key];
                }
            }
        });

        /**
         * 设置模块数据
         * @param props， 要设置属性的集合， 为普通对象，比如 {a: 1, b:2}, 代表设置模块中a属性为1， b属性为2
         */
        prototype.setData = function (props) {
            const state = _store.getState()[ns];
            const keys = Object.keys(props);
            if (keys.some(key => props[key] !== state[key])) {
                _store.dispatch({type: `spring/${ns}`, payload: {...state, ...props}});
            }
        };
        _prototype.setData = prototype.setData;

        const initState = Object.create(prototype);

        /**
         * 重置模块数据到初始状态， 一般用于组件销毁的时候调用
         */
        prototype.reset = function () {
            wiredList.forEach(key => {
                initState[key] = rootState[__wired[key]];
            })
            _store.dispatch({type: `spring/${ns}`, payload: initState});
        };
        _prototype.reset = prototype.reset;
        const rootState = _store.getState() || {};
        const finalInstance = rootState[ns] ? rootState[ns] : instance;
        Object.getOwnPropertyNames(instance).forEach(key => {
            if (__wired[key]) {
                initState[key] = rootState[__wired[key]];
                return;
            }
            initState[key] = finalInstance[key];
        });
        if(rootState[ns]) { // 热更新时候用得到
            rootState[ns] = initState;
        }
        const reducer = (state = initState, {type, payload}) => {
            if (type === `spring/${ns}`) {
                const result = Object.create(prototype);
                assign(result, payload);
                return result;
            }
            return state;
        };
        injectReducer(ns, reducer);
        allProto[ns] = prototype;
        if(typeof allProto[ns].created === 'function') {
            allProto[ns].created();
        }
        Clazz.ns = ns;
        Clazz.prototype = allProto[ns];
        return Clazz;
    };
}

/**
 * react hooks 方式获取模块类实例
 * @param Class 模块类
 */
export const useModel = <T extends Model | Object>(Class: { new(): T }): T => {
    // @ts-ignore
    const ns = Class.ns || Class;
    const [data, setData] = useState(() => _store.getState()[ns]);
    useEffect(() => _store.subscribe(() => {
        const ret = _store.getState()[ns];
        setData(ret);
    }), []);

    return data;
};
/**
 * 重置模块数据
 * @param Class 模块类|模块名称
 */
export const resetModel = <T extends Model | Object>(Class: { new(): T } | string) => {
    // @ts-ignore
    const ns = Class.ns || Class;
    allProto[ns].reset();
};
/**
 * 按照类型自动注入Model实例
 * @param Class 模块类
 */
export function inject<T extends Model | Object>(Class: { new(): T }) {
    // @ts-ignore
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
 * @param ns 模块名称
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
 * 基础模块， 最佳实践，每个模块都应继承基础模块类
 */
export class Model {
    static ns = '';
    setData(data: Object) {
        return;
    }
    reset() {
        return;
    }
}
/**
 * 按照类型自动注入Model实例
 * @param Class 模块类
 */
export const autowired = inject;


/**
 * 初始化redux-spring
 * @param store 需要注入的store
 * @param asyncReducers 兼容老reducer集合
 */
export default (store, asyncReducers = {}) => {
    _store = store;
    _asyncReducers = asyncReducers;
};
