import {isPromise} from '../helpers/promise'
import {store, handleMutex }from './Sync'

/**
 * 并发控制
 * @param mutexId 互斥标识，具有相同标识的函数不会并发执行
 * @param mode 互斥模式：
 *     discard - 丢弃模式（默认）
 *     merge - 合并模式，共享执行结果
 *     wait - 等待模式，依次顺序执行
 */
export function SyncFn(func: Function, mutexId: string, mode = 'discard') {
  store[mutexId] = store[mutexId] || {
    running: false,
    listeners: []
  }
  let mutex = store[mutexId]

  return async function (...args: []) {
    //并发处理
    if (mutex.running) {
      //上一次操作尚未结束
      switch (mode) {
        case 'discard': //丢弃模式，无视本次调用
          return
        case 'merge': //合并模式，直接使用上次操作结果作为本次调用结果返回
          return await new Promise((resolve) => {
            mutex.listeners.push({
              block: false,
              handler: resolve
            })
          })
        case 'wait': //等待模式，等待上次操作结束后再开始本次操作
          await new Promise((resolve) => {
            mutex.listeners.push({
              block: true,
              handler: resolve
            })
          })
          break
        default:
          console.error('unknown mode:', mode)
          return
      }
    }

    // 执行原方法
    mutex.running = true
    const returnValue = func.apply(null, args)

    if (isPromise(returnValue)) {
      returnValue.then(() => handleMutex(returnValue, mutex))
    } else {
      handleMutex(returnValue, mutex)
    }
    // 将原方法的返回值返回
    return returnValue
  }
}
