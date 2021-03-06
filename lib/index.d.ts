/**
 * redux-spring
 * Copyright (c) 2020 Sampson Li (lichun) <740056710@qq.com>
 * @license MIT
 */
import { Store } from 'redux';
/**
 * 创建模块
 * @param {string} ns -- 模块名称， 模块名称唯一， 不能有冲突
 */
export declare function service(ns: string): <T extends Model, K extends {
    new (): T;
    ns?: string;
}>(Clazz: K) => K;
/**
 * react hooks 方式获取模块类实例
 * @param Class 模块类
 */
export declare const useModel: <T extends Model>(Class: {
    new (): T;
    ns: string;
}) => T;
/**
 * 按照类型自动注入Model实例
 * @param {Model} Class --模块类
 */
export declare function inject<T extends Model>(Class: {
    new (): T;
    ns: string;
}): (clazz: any, attr: any) => void;
/**
 * 按照模块名自动注入Model实例
 * @param {string} ns --模块名称
 */
export declare function resource(ns: string): (clazz: any, attr: any) => void;
/**
 * 模块基类，每个模块都应继承该基础模块类
 */
export declare class Model {
    static ns: string;
    /**
     * 批量设置模块数据
     * @param {Object} data - key-value 对象
     */
    setData<T>(this: T, data: {
        [p in {
            [c in keyof T]: T[c] extends Function ? never : c;
        }[keyof T]]?: T[p];
    }): void;
    /**
     * 重置模块数据到初始默认值
     */
    reset(): void;
}
/**
 * 转换generator类型到promise类型， 如果主项目使用ts开发， 可以通过此方法可以转换到Promise类型避免ts类型提示错误
 * @param gen 被转换的generator类型
 */
export declare const convert: <T>(gen: Generator<unknown, T, unknown>) => Promise<T>;
declare const _default: <T extends Store<any, import("redux").AnyAction>>(store: T, asyncReducers?: {}) => T;
/**
 * 初始化redux-spring
 * @param {Store} store --需要注入的store
 * @param asyncReducers --兼容老reducer集合
 * @return {Store}
 */
export default _default;
