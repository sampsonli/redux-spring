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
const allBeans = {};

function assign(target, from) {
    // @ts-ignore
    if(Object.assgin) return Object.assign(...arguments);
    const to = Object(target);
    for (let index = 1; index < arguments.length; index++) {
        const nextSource = arguments[index];

        if (nextSource !== null && nextSource !== undefined) {
            for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    to[nextKey] = nextSource[nextKey];
                }
            }
        }
    }
    return to;
}

export function Resource(ns: string) {
    return (Clazz) => {
        const Result = function (...args) {
            const instance = new Clazz(...args);
            const __wired = Clazz.prototype.__wired || {};
            delete Clazz.prototype.__wired;
            if (!ns) {
                throw new Error("please define 'ns' before");
            }

            function doUpdate(newState, oldState) {
                const keys = Object.keys(newState);
                const diff = keys.some(key => newState[key] !== oldState[key]);
                if (diff) {
                    const result = Object.create(allProto[ns]);
                    // @ts-ignore
                    assign(result, newState);
                    _store.dispatch({type: `spring/${ns}`, payload: result});
                }
            }

            // const prototype = Object.create(instance);
            const prototype = {};
            // @ts-ignore
            prototype.ns = ns;
            // const _prototype = Object.create(instance);
            const _prototype = {};
            // @ts-ignore
            _prototype.ns = ns;
            let superProps = [];
            if (Object.getPrototypeOf(Clazz) !== Function.prototype) {
                superProps = Object.getOwnPropertyNames(Object.getPrototypeOf(Clazz).prototype);
            }
            [...superProps, ...Object.getOwnPropertyNames(Clazz.prototype)].forEach(key => {
                if (key !== 'constructor' && typeof Clazz.prototype[key] === 'function') {
                    const origin = Clazz.prototype[key];
                    prototype[key] = function (...params) {
                        const _this = Object.create(_prototype);
                        if (origin.prototype.toString() === '[object Generator]') {
                            const runGen = (ge, val, isError, e) => {
                                const rootState = _store.getState();
                                const state = rootState[ns];
                                const _state = {};
                                Object.keys(state).forEach((_key) => {
                                    if (__wired[key]) {
                                        _this[_key] = rootState[__wired[key]];
                                    } else {
                                        _this[_key] = state[_key];
                                    }
                                    _state[_key] = _this[_key];
                                });
                                let tmp;
                                try {
                                    if (isError) {
                                        tmp = ge.throw(e);
                                    } else {
                                        tmp = ge.next(val);
                                    }
                                } catch (error) {
                                    doUpdate(_this, _state);
                                    ge.throw(error);
                                }
                                doUpdate(_this, _state);
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
                        let _state = {};
                        Object.keys(state).forEach(_key => {
                            if (__wired[key]) {
                                _this[_key] = rootState[__wired[key]];
                            } else {
                                _this[_key] = state[_key];
                            }
                            _state[_key] = _this[_key];
                        });
                        const result = origin.bind(_this)(...params);
                        if (result && typeof result.then === 'function') {
                            doUpdate(_this, _state);
                            _state = {..._this};
                            return result.then(data => {
                                doUpdate(_this, _state);
                                return data;
                            });
                        }
                        doUpdate(_this, _state);
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
            // @ts-ignore
            prototype.setData = function (props) {
                const state = _store.getState()[ns];
                const keys = Object.keys(props);
                if (keys.some(key => props[key] !== state[key])) {
                    const _state = Object.create(allProto[ns]);
                    // @ts-ignore
                    assign(_state, state, props);
                    _store.dispatch({type: `spring/${ns}`, payload: _state});
                }
            };
            // @ts-ignore
            _prototype.setData = prototype.setData;


            const initState = Object.create(prototype);

            /**
             * 重置模块数据到初始状态， 一般用于组件销毁的时候调用
             */
            // @ts-ignore
            prototype.reset = function () {
                _store.dispatch({type: `spring/${ns}`, payload: initState});
            };
            const rootState = _store.getState();
            Object.getOwnPropertyNames(instance).forEach(key => {
                if (key.indexOf('_') === 0) {
                    prototype[key] = instance[key];
                    return;
                }
                if (__wired[key]) {
                    initState[key] = rootState[__wired[key]];
                    return;
                }
                initState[key] = instance[key];
            });
            const reducer = (state = initState, {type, payload}) => {
                if (type === `spring/${ns}`) {
                    return payload;
                }
                return state;
            };
            injectReducer(ns, reducer);
            if (allProto[ns]) {
                const state = Object.create(prototype);
                assign(state, _store.getState()[ns]);
                _store.dispatch({type: `spring/${ns}`, payload: state});
            }
            allProto[ns] = prototype;
            return initState;
        };
        Result.ns = ns;
        // @ts-ignore
        allBeans[ns] = new Result();
        return Result;
    };
}

export const useModel = <T>(T: { new(): T; }): T => {
    // @ts-ignore
    const ns = T.ns || T;
    const [data, setData] = useState(() => _store.getState()[ns]);
    useEffect(() => _store.subscribe(() => {
        const ret = _store.getState()[ns];
        setData(ret);
    }), []);

    return data;
};
export const Controller = Resource;
export const resetModel = <T>(T: { new(): T; }) => {
    // @ts-ignore
    const ns = T.ns || T;
    allProto[ns].reset();
};

export function AutoWired<T>(T: { new(): T; } | String) {
    // @ts-ignore
    const ns = T.ns || T;
    return (clazz, attr: T) => {
        if (!clazz.__wired) {
            clazz.__wired = {};
        }
        clazz.__wired[attr] = ns;
    };
}

export default (store, asyncReducers = {}) => {
    _store = store;
    _asyncReducers = asyncReducers;
};
