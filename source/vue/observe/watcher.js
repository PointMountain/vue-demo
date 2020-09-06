import { pushTarget, popTarget } from './dep'
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
    }
    this.cb = cb
    this.deps = []
    this.depsId = new Set()
    this.opts = opts
    this.id = id++

    this.get()  // 默认创建一个watcher 会调用自身的get方法
  }
  get(){
    pushTarget(this) // 渲染watcher Dep.target = watcher
    // 默认创建watcher就会调用此方法
    this.getter() // 让这个当前传入的函数执行
    popTarget()
  }
  addDep(dep){ // 同一个watcher 不应该重复记录dep 让watcher和dep互相记忆
    let id = dep.id
    if(!this.depsId.has(id)){
      this.depsId.add(id)
      this.deps.push(dep) // 就让watcher 记住当前dep
      dep.addSub(this)
    }
  }
  update(){ // 如果立即调用get 会导致页面刷新 异步来更新
    queueWatcher(this)
  }
  run(){
    this.get()
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