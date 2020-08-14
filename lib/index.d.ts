export declare function Resource(ns: string): any;
export declare const useModel: <T>(Clazz: new () => T) => T;
export declare const Controller: typeof Resource;
export declare const resetModel: <T>(Clazz: new () => T) => void;
export declare function AutoWired<T>(Clazz: {
    new (): T;
} | String): (clazz: any, attr: any) => void;
declare const _default: (store: any, asyncReducers?: {}) => void;
export default _default;
