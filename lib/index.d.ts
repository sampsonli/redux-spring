/**
 * 创建模块
 * @param ns 模块名称， 模块名称唯一， 不能有冲突
 */
export declare function service(ns: string): any;
/**
 * react hooks 方式获取模块类实例
 * @param Class 模块类
 */
export declare const useModel: <T extends Object | Model>(Class: new () => T) => T;
/**
 * 重置模块数据
 * @param Class 模块类|模块名称
 */
export declare const resetModel: <T extends Object | Model>(Class: string | (new () => T)) => void;
/**
 * 按照类型自动注入Model实例
 * @param Class 模块类
 */
export declare function inject<T extends Model | Object>(Class: {
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
/**
 * 按照类型自动注入Model实例
 * @param Class 模块类
 */
export declare const autowired: typeof inject;
/**
 * 创建模块
 * @param ns 模块名称， 模块名称唯一， 不能有冲突
 */
export declare const controller: typeof service;
/**
 * 创建模块
 * @param ns 模块名称， 模块名称唯一， 不能有冲突
 */
export declare const model: typeof service;
declare const _default: (store: any, asyncReducers?: {}) => void;
/**
 * 初始化redux-spring
 * @param store 需要注入的store
 * @param asyncReducers 兼容老reducer集合
 */
export default _default;
