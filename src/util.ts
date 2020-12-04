
export function assign(target, from) {
    // @ts-ignore
    if (Object.assgin) return Object.assign(target, from); // 现代浏览器赋值
    Object.keys(from).forEach(key => {
        target[key] = from[key];
    })
    return target;
}

export function isGenerator(fn: Function): boolean {
    // return fn.prototype.toString() === '[object Generator]'
    const temp = fn.bind({})();
    return !!temp && temp.next !== undefined;
}
