(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.TsSyncDecorator = {}));
}(this, (function (exports) { 'use strict';

    function isPromise(obj) {
        return obj instanceof Promise || (obj && typeof obj.then === 'function');
    }

    var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator$1 = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    var store = {};
    function handleMutex(returnValue, mutex) {
        while (mutex.listeners.length > 0) {
            var listener = mutex.listeners[0];
            mutex.listeners = mutex.listeners.slice(1);
            listener.handler(returnValue);
            if (listener.block)
                return returnValue; //阻塞性监听
            //否则继续进行后续监听处理
        }
        mutex.running = false;
    }
    /**
     * 并发控制
     * @param mutexId 互斥标识，具有相同标识的函数不会并发执行
     * @param mode 互斥模式：
     *     discard - 丢弃模式（默认）
     *     merge - 合并模式，共享执行结果
     *     wait - 等待模式，依次顺序执行
     */
    function Sync(mutexId, mode) {
        if (mode === void 0) { mode = 'discard'; }
        return function (_target, funcName, descriptor) {
            mutexId = mutexId || funcName;
            store[mutexId] = store[mutexId] || {
                running: false,
                listeners: []
            };
            // 保存原有函数
            var original = descriptor.value;
            descriptor.value = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return __awaiter$1(this, void 0, void 0, function () {
                    var mutex, _a, returnValue;
                    return __generator$1(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                mutex = store[mutexId];
                                if (!mutex.running) return [3 /*break*/, 7];
                                _a = mode;
                                switch (_a) {
                                    case 'discard': return [3 /*break*/, 1];
                                    case 'merge': return [3 /*break*/, 2];
                                    case 'wait': return [3 /*break*/, 4];
                                }
                                return [3 /*break*/, 6];
                            case 1: //丢弃模式，无视本次调用
                            return [2 /*return*/];
                            case 2: return [4 /*yield*/, new Promise(function (resolve) {
                                    mutex.listeners.push({
                                        block: false,
                                        handler: resolve
                                    });
                                })];
                            case 3: //合并模式，直接使用上次操作结果作为本次调用结果返回
                            return [2 /*return*/, _b.sent()];
                            case 4: //等待模式，等待上次操作结束后再开始本次操作
                            return [4 /*yield*/, new Promise(function (resolve) {
                                    mutex.listeners.push({
                                        block: true,
                                        handler: resolve
                                    });
                                })];
                            case 5:
                                _b.sent();
                                return [3 /*break*/, 7];
                            case 6:
                                console.error('unknown mode:', mode);
                                return [2 /*return*/];
                            case 7:
                                // 执行原方法
                                mutex.running = true;
                                returnValue = original.apply(this, args);
                                if (isPromise(returnValue)) {
                                    returnValue.then(function () { return handleMutex(returnValue, mutex); });
                                }
                                else {
                                    handleMutex(returnValue, mutex);
                                }
                                // 将原方法的返回值返回
                                return [2 /*return*/, returnValue];
                        }
                    });
                });
            };
        };
    }

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };
    /**
     * 并发控制
     * @param mutexId 互斥标识，具有相同标识的函数不会并发执行
     * @param mode 互斥模式：
     *     discard - 丢弃模式（默认）
     *     merge - 合并模式，共享执行结果
     *     wait - 等待模式，依次顺序执行
     */
    function SyncFn(func, mutexId, mode) {
        if (mode === void 0) { mode = 'discard'; }
        store[mutexId] = store[mutexId] || {
            running: false,
            listeners: []
        };
        var mutex = store[mutexId];
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return __awaiter(this, void 0, void 0, function () {
                var _a, returnValue;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!mutex.running) return [3 /*break*/, 7];
                            _a = mode;
                            switch (_a) {
                                case 'discard': return [3 /*break*/, 1];
                                case 'merge': return [3 /*break*/, 2];
                                case 'wait': return [3 /*break*/, 4];
                            }
                            return [3 /*break*/, 6];
                        case 1: //丢弃模式，无视本次调用
                        return [2 /*return*/];
                        case 2: return [4 /*yield*/, new Promise(function (resolve) {
                                mutex.listeners.push({
                                    block: false,
                                    handler: resolve
                                });
                            })];
                        case 3: //合并模式，直接使用上次操作结果作为本次调用结果返回
                        return [2 /*return*/, _b.sent()];
                        case 4: //等待模式，等待上次操作结束后再开始本次操作
                        return [4 /*yield*/, new Promise(function (resolve) {
                                mutex.listeners.push({
                                    block: true,
                                    handler: resolve
                                });
                            })];
                        case 5:
                            _b.sent();
                            return [3 /*break*/, 7];
                        case 6:
                            console.error('unknown mode:', mode);
                            return [2 /*return*/];
                        case 7:
                            // 执行原方法
                            mutex.running = true;
                            returnValue = func.apply(null, args);
                            if (isPromise(returnValue)) {
                                returnValue.then(function () { return handleMutex(returnValue, mutex); });
                            }
                            else {
                                handleMutex(returnValue, mutex);
                            }
                            // 将原方法的返回值返回
                            return [2 /*return*/, returnValue];
                    }
                });
            });
        };
    }

    exports.Sync = Sync;
    exports.SyncFn = SyncFn;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
