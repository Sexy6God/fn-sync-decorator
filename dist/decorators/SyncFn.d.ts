/**
 * 并发控制
 * @param mutexId 互斥标识，具有相同标识的函数不会并发执行
 * @param mode 互斥模式：
 *     discard - 丢弃模式（默认）
 *     merge - 合并模式，共享执行结果
 *     wait - 等待模式，依次顺序执行
 */
export declare function SyncFn(func: Function, mutexId: string, mode?: string): () => Promise<any>;
