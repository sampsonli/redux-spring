"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var redux_1 = require("redux");
var react_1 = require("react");
var _store;
var _asyncReducers = {};
function injectReducer(key, reducer) {
    if (_store) {
        _asyncReducers[key] = reducer;
        _store.replaceReducer(redux_1.combineReducers(__assign({}, _asyncReducers)));
    }
    else {
        throw new Error('spring is not initialized, please invoke "spring(store)" before');
    }
}
var allProto = {};
var allBeans = {};
function assign(target, from) {
    // @ts-ignore
    if (Object.assgin)
        return Object.assign.apply(Object, arguments);
    var to = Object(target);
    for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
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
/**
 * 创建模块
 * @param ns 模块名称， 模块名称唯一， 不能有冲突
 */
function service(ns) {
    return function (Clazz) {
        var Result = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var instance = new (Clazz.bind.apply(Clazz, __spreadArrays([void 0], args)))();
            var __wired = Clazz.prototype.__wired || {};
            var wiredList = Object.keys(__wired);
            delete Clazz.prototype.__wired;
            if (!ns) {
                throw new Error("please define 'ns' before");
            }
            function doUpdate(newState) {
                var keys = Object.keys(newState);
                var rootState = _store.getState();
                var oldState = rootState[ns];
                var diff = keys.some(function (key) { return newState[key] !== oldState[key]; }) || wiredList.some(function (key) { return newState[key] !== rootState[__wired[key]]; });
                if (diff) {
                    wiredList.forEach(function (key) {
                        newState[key] = rootState[__wired[key]];
                    });
                    _store.dispatch({ type: "spring/" + ns, payload: newState });
                }
            }
            var prototype = { ns: ns };
            var _prototype = { ns: ns };
            Object.getOwnPropertyNames(Clazz.prototype).forEach(function (key) {
                if (key !== 'constructor' && typeof Clazz.prototype[key] === 'function') {
                    var origin_1 = Clazz.prototype[key];
                    prototype[key] = function () {
                        var params = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            params[_i] = arguments[_i];
                        }
                        var _this = Object.create(_prototype);
                        if (origin_1.prototype.toString() === '[object Generator]') {
                            var runGen_1 = function (ge, val, isError, e) {
                                var rootState = _store.getState();
                                var state = rootState[ns];
                                Object.keys(state).forEach(function (_key) {
                                    if (__wired[key]) {
                                        _this[_key] = rootState[__wired[key]];
                                    }
                                    else {
                                        _this[_key] = state[_key];
                                    }
                                });
                                var tmp;
                                try {
                                    if (isError) {
                                        tmp = ge.throw(e);
                                    }
                                    else {
                                        tmp = ge.next(val);
                                    }
                                }
                                catch (error) {
                                    doUpdate(_this);
                                    ge.throw(error);
                                }
                                doUpdate(_this);
                                if (tmp.done) {
                                    return tmp.value;
                                }
                                if (tmp.value && tmp.value.then) {
                                    return tmp.value.then(function (data) { return runGen_1(ge, data, false, null); }).catch(function (error) { return runGen_1(ge, null, true, error); });
                                }
                                return runGen_1(ge, tmp.value, false, null);
                            };
                            return Promise.resolve().then(function () { return runGen_1(origin_1.bind(_this).apply(void 0, params), null, false, null); });
                        }
                        var rootState = _store.getState();
                        var state = rootState[ns];
                        Object.keys(state).forEach(function (_key) {
                            if (__wired[key]) {
                                _this[_key] = rootState[__wired[key]];
                            }
                            else {
                                _this[_key] = state[_key];
                            }
                        });
                        var result = origin_1.bind(_this).apply(void 0, params);
                        if (result && typeof result.then === 'function') {
                            doUpdate(_this);
                            return result.then(function (data) {
                                doUpdate(_this);
                                return data;
                            });
                        }
                        doUpdate(_this);
                        return result;
                    };
                    if (origin_1.prototype.toString() === '[object Generator]') {
                        _prototype[key] = prototype[key];
                    }
                    else {
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
                var state = _store.getState()[ns];
                var keys = Object.keys(props);
                if (keys.some(function (key) { return props[key] !== state[key]; })) {
                    var _state_1 = Object.create(allProto[ns]);
                    // @ts-ignore
                    assign(_state_1, state, props);
                    wiredList.forEach(function (key) {
                        _state_1[key] = rootState[__wired[key]];
                    });
                    _store.dispatch({ type: "spring/" + ns, payload: _state_1 });
                }
            };
            // @ts-ignore
            _prototype.setData = prototype.setData;
            var initState = Object.create(prototype);
            /**
             * 重置模块数据到初始状态， 一般用于组件销毁的时候调用
             */
            // @ts-ignore
            prototype.reset = function () {
                wiredList.forEach(function (key) {
                    initState[key] = rootState[__wired[key]];
                });
                _store.dispatch({ type: "spring/" + ns, payload: initState });
            };
            var rootState = _store.getState();
            var finalInstance = rootState[ns] ? rootState[ns] : instance;
            Object.getOwnPropertyNames(instance).forEach(function (key) {
                if (__wired[key]) {
                    initState[key] = rootState[__wired[key]];
                    return;
                }
                initState[key] = finalInstance[key];
            });
            var reducer = function (state, _a) {
                if (state === void 0) { state = initState; }
                var type = _a.type, payload = _a.payload;
                if (type === "spring/" + ns) {
                    var result = Object.create(prototype);
                    assign(result, payload);
                    return result;
                }
                return state;
            };
            injectReducer(ns, reducer);
            allProto[ns] = prototype;
            return initState;
        };
        Result.ns = ns;
        // @ts-ignore
        allBeans[ns] = new Result();
        return Result;
    };
}
exports.service = service;
/**
 * react hooks 方式获取模块类实例
 * @param Class 模块类
 */
exports.useModel = function (Class) {
    // @ts-ignore
    var ns = Class.ns || Class;
    var _a = react_1.useState(function () { return _store.getState()[ns]; }), data = _a[0], setData = _a[1];
    react_1.useEffect(function () { return _store.subscribe(function () {
        var ret = _store.getState()[ns];
        setData(ret);
    }); }, []);
    return data;
};
/**
 * 重置模块数据
 * @param Class 模块类|模块名称
 */
exports.resetModel = function (Class) {
    // @ts-ignore
    var ns = Class.ns || Class;
    allProto[ns].reset();
};
/**
 * 按照类型自动注入Model实例
 * @param Class 模块类
 */
function inject(Class) {
    // @ts-ignore
    var ns = Class.ns;
    return function (clazz, attr) {
        if (!clazz.__wired) {
            clazz.__wired = {};
        }
        clazz.__wired[attr] = ns;
    };
}
exports.inject = inject;
/**
 * 按照模块名自动注入Model实例
 * @param ns 模块名称
 */
function resource(ns) {
    return function (clazz, attr) {
        if (!clazz.__wired) {
            clazz.__wired = {};
        }
        clazz.__wired[attr] = ns;
    };
}
exports.resource = resource;
/**
 * 基础模块， 最佳实践，每个模块都应继承基础模块
 */
var Model = /** @class */ (function () {
    function Model() {
    }
    Model.prototype.setData = function (data) {
        return;
    };
    Model.prototype.reset = function () {
        return;
    };
    Model.ns = '';
    return Model;
}());
exports.Model = Model;
/**
 * 按照类型自动注入Model实例
 * @param Class 模块类
 */
exports.autowired = inject;
/**
 * 创建模块
 * @param ns 模块名称， 模块名称唯一， 不能有冲突
 */
exports.controller = service;
/**
 * 创建模块
 * @param ns 模块名称， 模块名称唯一， 不能有冲突
 */
exports.model = service;
/**
 * 初始化redux-spring
 * @param store 需要注入的store
 * @param asyncReducers 兼容老reducer集合
 */
exports.default = (function (store, asyncReducers) {
    if (asyncReducers === void 0) { asyncReducers = {}; }
    _store = store;
    _asyncReducers = asyncReducers;
});
//# sourceMappingURL=index.js.map