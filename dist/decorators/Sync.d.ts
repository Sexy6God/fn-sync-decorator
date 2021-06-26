export interface SyncStore {
    [index: string]: Mutex;
}
export interface Mutex {
    running: boolean;
    listeners: SyncListener[];
}
export interface SyncListener {
    block: boolean;
    handler: Function;
}
export declare const store: SyncStore;
export declare function handleMutex(returnValue: any, mutex: Mutex): any;
/**
 * 并发控制
 * @param mutexId 互斥标识，具有相同标识的函数不会并发执行
 * @param mode 互斥模式：
 *     discard - 丢弃模式（默认）
 *     merge - 合并模式，共享执行结果
 *     wait - 等待模式，依次顺序执行
 */
export declare function Sync(mutexId: string, mode?: string): (_target: any, funcName: string, descriptor: any) => void;
