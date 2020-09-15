import {
  initState
} from './observe'
import Watcher from './observe/watcher'
import { compiler, util } from './util'
import { h, render, patch } from './vdom'
function Vue(options) { // vue中原始用户传入的数据
  this._init(options)
}

Vue.prototype._init = function (options) {
  // vue中初始化  this.$options 表示的是vue中的参数
  const vm = this
  vm.$options = options

  // MVVM原理 需要数据重新初始化
  // 拦截数组的方法 和 对象的属性
  initState(vm) // data computed watch
  // ....

  // 初始化工作 vue1.0 =>

  if (vm.$options.el) {
    vm.$mount()
  }
}

// 渲染页面 将组件进行挂载
function query(el) {
  if (typeof el === 'string') {
    return document.querySelector(el)
  }
  return el
}


Vue.prototype._update = function (vnode) {
  // 用用户传入的数据 去更新视图
  let vm = this
  let el = vm.$el
  let preVnode = vm.preVnode // 第一次肯定没有
  if(!preVnode){ // 初次渲染
    vm.preVnode = vnode // 把上一次的节点保存起来
    render(vnode, el)
  }else{
    vm.$el = patch(vm.preVnode, vnode)
  }

  // 要循环这个元素 将里面的内容 换成我们的数据
  // let node = document.createDocumentFragment()
  // let firstChild
  // while (firstChild = el.firstChild) { // 每次拿到第一个元素 就将这个元素放入到文档碎片中
  //   node.appendChild(firstChild) // appendChild是具有移动的功能的
  // }
  // // todo 对文本进行替换
  // compiler(node, vm)
  // el.appendChild(node)
  // 需要匹配{{}}的方式来进行替换

  // 依赖收集 属性变化了 需要重新渲染 watcher
}
Vue.prototype._render = function() {
  let vm = this
  let render = this.$options.render // 获取用户编写的render方法
  let vnode = render.call(vm, h)
  return vnode
}
Vue.prototype.$mount = function () {
  let vm = this
  let el = vm.$options.el // 获取元素
  el = vm.$el = query(el) // 获取当前挂载的节点 vm.$el就是要挂载的一个元素

  // 渲染时通过 watcher 来渲染的
  // 渲染watcher 用于渲染的watcher
  // vue2.0 组件级别更新 new Vue 产生一个组件

  let updateComponent = () => { // 更新组件，渲染的逻辑
    vm._update(vm._render()) // 更新组件
  }
  new Watcher(vm, updateComponent) // 渲染watcher
  // 需要让每个数据 更改了 需要重新渲染
}

Vue.prototype.$watch = function(expr, handler, opts){
  let vm = this
  new Watcher(vm, expr, handler, {user: true, ...opts}) // 标识用户自己定义的watch
}

export default Vue