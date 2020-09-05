// 主要要做的事就是拦截用户调用的push pop shift unshift splice reverse sort
// 先获取老的数组的方法 只改写这7个方法

import {
  observe
} from './index'

const oldArrayProtoMethods = Array.prototype

// 拷贝的一个新的对象，防止污染数组原生的原型 可以查找到 老的方法
export const arrayMethods = Object.create(oldArrayProtoMethods)

const methods = [
  'push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'
]

export function observerArray(inserted) { // 要循环数组一次对数组中每一项进行观测
  for (let i = 0; i < inserted.length; i++) {
    observe(inserted[i])
  }
}

methods.forEach(method => {
  arrayMethods[method] = function (...args) { // 函数劫持 切片编程
    const r = oldArrayProtoMethods[method].apply(this, args)
    // todo
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2) // splice(index, howmany, item1, item2) splice从第三项开始是传的参数
      default:
        break;
    }
    if (inserted) observerArray(inserted)
    console.log('调用了数组更新的方法')
    return r
  }
})