export declare function Service(ns: string): any;
export declare const useModel: <T>(Clazz: new () => T) => T;
export declare const resetModel: <T>(Clazz: new () => T) => void;
export declare function Inject<T>(Clazz: {
    new (): T;
}): (clazz: any, attr: any) => void;
export declare function Resource(ns: string): (clazz: any, attr: any) => void;
export declare const Autowired: typeof Inject;
export declare const Controller: typeof Service;
export declare const Model: typeof Service;
declare const _default: (store: any, asyncReducers?: {}) => void;
export default _default;
