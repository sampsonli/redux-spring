"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGenerator = exports.assign = void 0;
function assign(target, from) {
    // @ts-ignore
    if (Object.assgin)
        return Object.assign(target, from); // 现代浏览器赋值
    Object.keys(from).forEach(function (key) {
        target[key] = from[key];
    });
    return target;
}
exports.assign = assign;
function isGenerator(fn) {
    // ts 配置es5 有个bug, 只能按照下面的方式解决了
    if (typeof __dirname === 'undefined' || __dirname.length < 3) { // 浏览器环境
        return fn.prototype.toString() === '[object Generator]';
    }
    var temp = fn.bind({})();
    return !!temp && temp.next !== undefined;
}
exports.isGenerator = isGenerator;
//# sourceMappingURL=util.js.map