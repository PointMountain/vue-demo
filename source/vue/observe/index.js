import Observer from './observer'
import Watcher from './watcher'
import Dep from './dep'

export function initState(vm) {
  // 做不同的初始化工作
  const opts = vm.$options
  if (opts.data) {
    initData(vm) // 初始化数据
  }
  if (opts.computed) {
    initComputed(vm, opts.computed) // 初始化计算属性
  }
  if (opts.watch) {
    initWatch(vm) // 初始化watch
  }
}

export function observe(data) {
  if (typeof data !== 'object' || data == null) {
    return
  }
  if(data.__ob__){ // 已经被监控过了
    return data.__ob__
  }
  return new Observer(data)
}

function proxy(vm, source, key) {  // 代理数据 vm.msg = vm._data.msg
  Object.defineProperty(vm, key, {
    get() {
      return vm[source][key]
    },
    set(newValue) {
      vm[source][key] = newValue
    }
  })
}

function initData(vm) { // 将用户插入的数据 通过Object.defineProperty重新定义
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}

  for (let key in data) {
    proxy(vm, '_data', key) // 会将对vm上的取值操作和复制操作代理给vm._data 属性
  }

  observe(vm._data) // 观察数据
}

function createComputedGetter(vm, key) {
  let watcher = vm._watchersComputed[key] // 这个watcher就是开始定义的计算属性watcher
  return function () { // 用户取值是会执行此方法
    if(watcher){
      if(watcher.dirty){ // 如果页面取值 且dirty是true 就回去调用watcher的get方法
        watcher.evaluate()
      }
      if(Dep.target){ // watcher 就是计算属性watcher
        watcher.depend()
      }
      return watcher.value
    }
  }
}

function initComputed(vm, computed) {
  // 将计算属性的配置 放到vm上
  let watchers = vm._watchersComputed = Object.create(null) // 创建存储用户计算属性的watcher对象

  for (const key in computed) {  // { fullName: () => this.firstName + this.lastName }
    let def = computed[key]
    watchers[key] = new Watcher(vm, def, () => {}, {lazy: true}) // 计算属性watcher 默认刚开始此方法不会执行

    Object.defineProperty(vm, key, {
      get: createComputedGetter(vm, key)
    }) // 将属性定义到vm上
  }
}

function createWatcher(vm, key, handler, opts){
  // 内部最终也会使用$watch
  return vm.$watch(key, handler, opts)
}

function initWatch(vm) {
  let watch = vm.$options.watch
  for (const key in watch) { // msg(){}
    let userDef = watch[key]
    let handler = userDef
    if(userDef.handler){
      handler = userDef.handler
    }
    createWatcher(vm, key, handler, {immediate: userDef.immediate})
  }
}