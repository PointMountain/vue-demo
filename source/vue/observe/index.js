import Observer from './observer'

export function initState(vm) {
  // 做不同的初始化工作
  const opts = vm.$options
  if (opts.data) {
    initData(vm) // 初始化数据
  }
  if (opts.computed) {
    initComputed() // 初始化计算属性
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

function initComputed() {

}

function createWatcher(vm, key, handler){
  // 内部最终也会使用$watch
  return vm.$watch(key, handler)
}

function initWatch(vm) {
  let watch = vm.$options.watch
  for (const key in watch) { // msg(){}
    let handler = watch[key]
    createWatcher(vm, key, handler)
  }
}