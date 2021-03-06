import { pushTarget, popTarget } from './dep'
import { util } from '../util'
let id = 0
class Watcher {
  /**
   *
   * @param {*} vm 当前组件的实例 new Vue
   * @param {*} exprOrFn 用户可能传入的是一个表达式，也有可能传入的是一个函数
   * @param {*} cb 用户传入的回调函数 vm.$watch('msg', cb)
   * @param {*} opts // 一些其他参数
   */
  constructor(vm, exprOrFn, cb = () => {}, opts = {}) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    if(typeof exprOrFn === 'function'){
      this.getter = exprOrFn  // getter就是new Watcher传入的第二个函数
    }else{
      this.getter = function() { // 如果调用此方法 会将vm上对应的表达式取出
        return util.getValue(vm, exprOrFn)
      }
    }
    if(opts.user){ // 标识是用户自己写的watcher
      this.user = true
    }
    this.lazy = opts.lazy // 如果为true 则为计算属性
    this.dirty = this.lazy
    this.cb = cb
    this.deps = []
    this.depsId = new Set()
    this.opts = opts
    this.id = id++
    this.immediate = opts.immediate
    // 创建watcher的时候 先将表达式对应的值取出来（老值）
    // 如果当前是计算属性的话 不会默认调用get方法
    this.value = this.lazy ? undefined : this.get()  // 默认创建一个watcher 会调用自身的get方法
    if(this.immediate){ // 如果有immediate 就直接运行用户定义的watcher
      this.cb(this.value)
    }
  }
  get(){
    pushTarget(this) // 渲染watcher Dep.target = watcher
    // 默认创建watcher就会调用此方法
    // 函数调用时就会将当前计算属性watcher存起来
    let value = this.getter.call(this.vm) // 让这个当前传入的函数执行
    popTarget()
    return value
  }
  evaluate() {
    this.value = this.get()
    this.dirty = false
  }
  addDep(dep){ // 同一个watcher 不应该重复记录dep 让watcher和dep互相记忆
    let id = dep.id
    if(!this.depsId.has(id)){
      this.depsId.add(id)
      this.deps.push(dep) // 就让watcher 记住当前dep
      dep.addSub(this)
    }
  }
  depend() {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }
  update(){ // 如果立即调用get 会导致页面刷新 异步来更新
    if(this.lazy){
      this.dirty = true
    }else{
      queueWatcher(this)
    }
  }
  run(){
    let value = this.get() // 新值
    if(this.value !== value){
      this.cb(value, this.value)
    }
  }
}

let has = {}
let queue = []
function flushQueue() {
  // 等待当前这一轮全部更新后 再去让watcher依次执行
  queue.forEach(watcher => watcher.run())
  has = {}
  queue = []
}
function queueWatcher(watcher) {
  let id = watcher.id
  if(has[id] == null){
    has[id] = true
    queue.push(watcher)  // 相同的watcher只会存一个到queue中

    // 延迟清空队列
    nextTick(flushQueue)
    // setTimeout(flushQueue, 0)
  }
}

// 渲染使用他 计算属性也要用他 vm.watch 也用他
let callbacks = []
function flushCallback(){
  callbacks.forEach(cb => cb())
}
export function nextTick(cb) { // cb就是flushQueue
  callbacks.push(cb)

  // 要异步刷新callbacks 获取一个异步的方法
  //                      微任务                     宏任务
  // 先采用微任务 会先执行(promise mutationObserver) setImmediate setTimeout
  let timerFunc = () => {
    flushCallback()
  }
  if(Promise){
    return Promise.resolve().then(timerFunc)
  }
  if(MutationObserver){
    let observer = new MutationObserver(timerFunc)
    let textNode = document.createTextNode(1)
    observer.observe(textNode, {characterData: true})
    textNode.textContent = 2
    return
  }
  if(setImmediate){
    return setImmediate(timerFunc)
  }
  setTimeout(timerFunc, 0)
}

// 等待页面更新后再去获取dom元素

export default Watcher