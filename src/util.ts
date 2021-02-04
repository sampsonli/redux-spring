
export function assign(target, from) {
    // @ts-ignore
    if (Object.assgin) return Object.assign(target, from); // 现代浏览器赋值
    Object.keys(from).forEach(key => {
        target[key] = from[key];
    })
    return target;
}

export function isGenerator(fn: Function): boolean {
    // ts 配置es5 有个bug, 只能按照下面的方式解决了
    if(process.env.NODE_ENV !== 'test') { // 浏览器环境
        const str = Object.prototype.toString.call(fn);
        if(str === '[object Function]' && fn.prototype && fn.prototype.toString() === '[object Generator]') {  // 可能是ie
            return true;
        }
        // [object GeneratorFunction] or [object Generator]
        return str === '[object GeneratorFunction]'
    }
    return fn.toString().indexOf('generator') > -1;

}
