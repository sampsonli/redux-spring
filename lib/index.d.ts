/**
 * 初始化模块
 * @param ns 模块名称， 模块名称唯一， 不能有冲突
 */
export declare function service(ns: string): any;
/**
 * react hooks 方式获取模块类实例
 * @param Class 模块类
 */
export declare const useModel: <T>(Class: new () => T) => T;
/**
 * 重置模块数据
 * @param Class 模块类
 */
export declare const resetModel: <T>(Class: new () => T) => void;
/**
 * 按照类型自动注入Model实例
 * @param Class 模块类
 */
export declare function inject<T>(Class: {
    new (): T;
}): (clazz: any, attr: any) => void;
/**
 * 按照模块名自动注入Model实例
 * @param ns 模块名称
 */
export declare function resource(ns: string): (clazz: any, attr: any) => void;
/**
 * 基础模块， 最佳实践，每个模块都应继承基础模块
 */
export declare class Model {
    static ns: string;
    setData(data: any): any;
}
export declare const autowired: typeof inject;
export declare const controller: typeof service;
export declare const model: typeof service;
declare const _default: (store: any, asyncReducers?: {}) => void;
export default _default;
