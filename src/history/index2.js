// 节约性能 先把真实节点 通过一个对象来表示 再通过对象渲染到页面上
// 前端操作dom的时候 排序 -》 正序反序 删除

// diff 新的节点 再生成一个对象

// vue代码基本上不用手动操作dom

// 虚拟dom 只是一个对象
// vue template render函数

// 初始化 将虚拟节点 渲染到页面
// <div id="container"><span style="color: red">hello</span>zf</div>
import { h, render, patch } from '../../source/vue/vdom'
// const oldVnode = h('div', { id: 'container', style: { background: 'blue' } },
//   h('span', { style: { color: 'red', fontSize: '20px', background: 'yellow' }, class: 'abc' }, 'hello'),
//   'zf'
// )
// const newVnode = h('div', { id: 'aa', style: { color: 'blue', fontSize: '18px' } },
//   h('span', { style: { color: 'green', fontSize: '40px' }, class: 'abc' }, 'world'),
//   'px'
// )
const oldVnode = h('div', { id: 'container' },
  h('li', { style: { background: 'red' }, key: 'a' }, 'a'),
  h('li', { style: { background: 'yellow' }, key: 'b' }, 'b'),
  h('li', { style: { background: 'blue' }, key: 'c' }, 'c'),
  h('li', { style: { background: 'green' }, key: 'd' }, 'd'),
  h('li', { style: { background: 'brown' }, key: 'e' }, 'e'),
  h('li', { style: { background: 'pink' }, key: 'f' }, 'f')
)
const newVnode = h('div', { id: 'aa' },
  h('li', { style: { background: 'red' }, key: 'a' }, 'a'),
  h('li', { style: { background: 'yellow' }, key: 'b' }, 'b'),
  h('li', { style: { background: 'blue' }, key: 'c' }, 'c'),
  h('li', { style: { background: 'green' }, key: 'd' }, 'd')
)

setTimeout(() => {
  patch(oldVnode, newVnode)
}, 1000)

// patchVnode 用心的虚拟节点 和 老的虚拟节点进行对比 更新真实dom元素

const container = document.getElementById('app')
render(oldVnode, container)

// new Vue({
//   render(h) {
//     return h('div', {}, 'hello')
//   }
// })