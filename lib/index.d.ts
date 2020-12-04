/**
 * 创建模块
 * @param {string} ns -- 模块名称， 模块名称唯一， 不能有冲突
 */
export declare function service(ns: string): (Clazz: any) => any;
/**
 * react hooks 方式获取模块类实例
 * @param Class 模块类
 */
export declare const useModel: <T extends Model>(Class: new () => T) => T;
/**
 * 按照类型自动注入Model实例
 * @param {Model} Class --模块类
 */
export declare function inject<T extends Model>(Class: {
    new (): T;
}): (clazz: any, attr: any) => void;
/**
 * 按照模块名自动注入Model实例
 * @param {string} ns --模块名称
 */
export declare function resource(ns: string): (clazz: any, attr: any) => void;
/**
 * 基础模块， 最佳实践，每个模块都应继承基础模块类
 */
export declare class Model {
    static ns: string;
    setData(data: Object): void;
    reset(): void;
}
declare const _default: (store: any, asyncReducers?: {}) => void;
/**
 * 初始化redux-spring
 * @param store --需要注入的store
 * @param asyncReducers --兼容老reducer集合
 */
export default _default;
