

import {isPromise} from '../helpers/promise'

export interface SyncStore {
  [index: string]: Mutex
}

export interface Mutex {
  running: boolean
  listeners: SyncListener[]
}

export interface SyncListener {
  block: boolean
  handler: Function
}

export const store: SyncStore = {}

export function handleMutex(returnValue: any, mutex: Mutex) {
  while (mutex.listeners.length > 0) {
    let listener = mutex.listeners[0]
    mutex.listeners = mutex.listeners.slice(1)
    listener.handler(returnValue)
    if (listener.block) return returnValue //阻塞性监听
    //否则继续进行后续监听处理
  }
  mutex.running = false
}

/**
 * 并发控制
 * @param mutexId 互斥标识，具有相同标识的函数不会并发执行
 * @param mode 互斥模式：
 *     discard - 丢弃模式（默认）
 *     merge - 合并模式，共享执行结果
 *     wait - 等待模式，依次顺序执行
 */
export function Sync(mutexId: string, mode = 'discard') {
  return function (_target: any, funcName: string, descriptor: any) {
    mutexId = mutexId || funcName
    store[mutexId] = store[mutexId] || {
      running: false,
      listeners: []
    }
    // 保存原有函数
    const original = descriptor.value

    descriptor.value = async function (...args: []) {
      let mutex = store[mutexId]
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
      const returnValue = original.apply(this, args)

      if (isPromise(returnValue)) {
        returnValue.then(() => handleMutex(returnValue, mutex))
      } else {
        handleMutex(returnValue, mutex)
      }
      // 将原方法的返回值返回
      return returnValue
    }
  }
}

