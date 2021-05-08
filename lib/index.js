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
Object.defineProperty(exports, "__esModule", { value: true });
exports.convert = exports.Model = exports.resource = exports.inject = exports.useModel = exports.service = void 0;
/**
 * redux-spring
 * Copyright (c) 2020 Sampson Li (lichun) <740056710@qq.com>
 * @license MIT
 */
var redux_1 = require("redux");
var react_1 = require("react");
var util_1 = require("./util");
var _store;
var _asyncReducers = {};
/**
 * 注入模块对应的reducer
 * @param {string} key
 * @param {function} reducer
 */
function injectReducer(key, reducer) {
    if (_store) {
        _asyncReducers[key] = reducer;
        _store.replaceReducer(redux_1.combineReducers(__assign({}, _asyncReducers)));
    }
    else {
        throw new Error('redux-spring is not initialized, please invoke "spring(store)" before!');
    }
}
// 保存所有模块的原型
var allProto = {};
// 保存所有模块的static属性, 方便开发模式热更新静态数据保留
var allStatic = {};
/**
 * 创建模块
 * @param {string} ns -- 模块名称， 模块名称唯一， 不能有冲突
 */
function service(ns) {
    return function (Clazz) {
        if (!ns) {
            throw new Error("please define 'ns' before");
        }
        var TYPE = "spring/" + ns;
        var instance = new Clazz();
        var __wired = Clazz.prototype.__wired || {};
        var wiredList = Object.keys(__wired);
        delete Clazz.prototype.__wired;
        function doUpdate(newState) {
            var keys = Object.keys(newState);
            var rootState = _store.getState();
            var oldState = rootState[ns];
            var diff = keys.some(function (key) { return newState[key] !== oldState[key]; }) || wiredList.some(function (key) { return newState[key] !== rootState[__wired[key]]; });
            if (diff) {
                wiredList.forEach(function (key) {
                    newState[key] = rootState[__wired[key]];
                });
                _store.dispatch({ type: TYPE, payload: newState });
            }
        }
        // 给外面用的原型实例
        var prototype = { setData: undefined, reset: undefined, created: undefined };
        // 给内部用的原型实例
        var _prototype = { setData: undefined, reset: undefined };
        Object.getOwnPropertyNames(Clazz.prototype).forEach(function (key) {
            if (key !== 'constructor' && typeof Clazz.prototype[key] === 'function') {
                var origin_1 = Clazz.prototype[key];
                var isGen_1 = util_1.isGenerator(origin_1); // 是否是generator方法
                prototype[key] = function () {
                    var params = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        params[_i] = arguments[_i];
                    }
                    var _this = Object.create(_prototype);
                    if (isGen_1) { // 如果当前方法是generator方法
                        var runGen_1 = function (ge, val, isError, e) {
                            var rootState = _store.getState();
                            var state = rootState[ns];
                            Object.keys(state).forEach(function (_key) {
                                if (__wired[_key]) {
                                    _this[_key] = rootState[__wired[_key]];
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
                        // 异步方法必须异步执行
                        return Promise.resolve().then(function () { return runGen_1(origin_1.bind(_this).apply(void 0, params), null, false, null); });
                    }
                    var rootState = _store.getState();
                    var state = rootState[ns];
                    Object.keys(state).forEach(function (_key) {
                        if (__wired[_key]) { // 更新注入的模块实例
                            _this[_key] = rootState[__wired[_key]];
                        }
                        else {
                            _this[_key] = state[_key];
                        }
                    });
                    var result = origin_1.bind(_this).apply(void 0, params);
                    if (result && typeof result.then === 'function') { // 如果返回来的是promise, 对数据进行同步， 此处可以兼容大部分async/await方法
                        doUpdate(_this);
                        return result.then(function (data) {
                            doUpdate(_this);
                            return data;
                        });
                    }
                    doUpdate(_this);
                    return result;
                };
                if (isGen_1) { // 解决异步方法嵌套调用问题
                    _prototype[key] = prototype[key];
                }
                else {
                    _prototype[key] = origin_1;
                }
            }
        });
        /**
         * 设置模块数据
         * @param props， 要设置属性的集合， 为普通对象，比如 {a: 1, b:2}, 代表设置模块中a属性为1， b属性为2
         */
        prototype.setData = function (props) {
            var state = _store.getState()[ns];
            var keys = Object.keys(props);
            if (keys.some(function (key) { return props[key] !== state[key]; })) {
                _store.dispatch({ type: TYPE, payload: __assign(__assign({}, state), props) });
            }
        };
        _prototype.setData = prototype.setData; // 模块内部也支持 调用setData方法
        var initState = Object.create(prototype);
        /**
         * 重置模块数据到初始状态， 一般用于组件销毁的时候调用
         */
        prototype.reset = function () {
            wiredList.forEach(function (key) {
                initState[key] = rootState[__wired[key]];
            });
            _store.dispatch({ type: TYPE, payload: initState });
        };
        _prototype.reset = prototype.reset;
        var rootState = _store.getState() || {};
        var finalInstance = rootState[ns] ? rootState[ns] : instance;
        Object.getOwnPropertyNames(instance).forEach(function (key) {
            initState[key] = finalInstance[key];
        });
        wiredList.forEach(function (key) {
            initState[key] = rootState[__wired[key]];
        });
        if (rootState[ns]) { // 热更新时候用得到
            rootState[ns] = initState;
        }
        var reducer = function (state, _a) {
            if (state === void 0) { state = initState; }
            var type = _a.type, payload = _a.payload;
            if (type === TYPE) {
                var result = Object.create(prototype);
                util_1.assign(result, payload);
                return result;
            }
            return state;
        };
        injectReducer(ns, reducer);
        var isHotReload = !!allProto[ns];
        /**
         * 开发模式 static数据保存和恢复
         */
        if (!isHotReload) {
            allStatic[ns] = util_1.assign({}, Clazz);
        }
        else {
            util_1.assign(Clazz, allStatic[ns]);
        }
        // 初始化提供created 方法调用, 热更新不重复调用
        if (typeof prototype.created === 'function' && !isHotReload) {
            prototype.created();
        }
        allProto[ns] = prototype;
        Clazz.ns = ns;
        util_1.assign(Clazz.prototype, prototype); // 覆盖初始原型对象
        return Clazz;
    };
}
exports.service = service;
/**
 * react hooks 方式获取模块类实例
 * @param Class 模块类
 */
exports.useModel = function (Class) {
    var ns = Class.ns;
    var _a = react_1.useState(function () { return _store.getState()[ns]; }), data = _a[0], setData = _a[1];
    react_1.useEffect(function () { return _store.subscribe(function () {
        var ret = _store.getState()[ns];
        if (data !== ret) {
            setData(ret);
        }
    }); }, []);
    return data;
};
/**
 * 按照类型自动注入Model实例
 * @param {Model} Class --模块类
 */
function inject(Class) {
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
 * @param {string} ns --模块名称
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
 * 模块基类，每个模块都应继承该基础模块类
 */
var Model = /** @class */ (function () {
    function Model() {
    }
    /**
     * 批量设置模块数据
     * @param {Object} data - key-value 对象
     */
    Model.prototype.setData = function (data) {
        return;
    };
    /**
     * 重置模块数据到初始默认值
     */
    Model.prototype.reset = function () {
        return;
    };
    Model.ns = '';
    return Model;
}());
exports.Model = Model;
/**
 * 转换generator类型到promise类型， 如果主项目使用ts开发， 可以通过此方法可以转换到Promise类型避免ts类型提示错误
 * @param gen 被转换的generator类型
 */
exports.convert = function (gen) {
    return gen;
};
/**
 * 初始化redux-spring
 * @param {Store} store --需要注入的store
 * @param asyncReducers --兼容老reducer集合
 * @return {Store}
 */
exports.default = (function (store, asyncReducers) {
    if (asyncReducers === void 0) { asyncReducers = {}; }
    _store = store;
    _asyncReducers = asyncReducers;
    return store;
});
//# sourceMappingURL=index.js.map