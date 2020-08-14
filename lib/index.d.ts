export declare function Resource(ns: string): (Clazz: any) => {
    (...args: any[]): {};
    ns: string;
};
export declare const useModel: <T>(T: new () => T) => T;
export declare const Controller: typeof Resource;
export declare const resetModel: <T>(T: new () => T) => void;
export declare function AutoWired<T>(T: {
    new (): T;
} | String): (clazz: any, attr: T) => void;
declare const _default: (store: any, asyncReducers?: {}) => void;
export default _default;
