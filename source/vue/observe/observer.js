import { observe } from './index'
import { arrayMethods, observerArray, dependArray } from './array'
import Dep from './dep'

export function defineReactive(data, key, value) { // 定义响应式的数据变化
  // vue不支持ie8 及 ie8以下的浏览器

  // 如果value依旧是一个对象的话，需要深度观察
  let childOb = observe(value)  // 递归观察 {} arr [1, 2, 3]
  let dep = new Dep() // dep里可以收集依赖 收集的是watcher
  Object.defineProperty(data, key, {
    get() {
      if(Dep.target){ // 这次有值用的是渲染watcher
        // 希望存入的watcher 不能重复 否则会造成更新时多次渲染
        dep.depend() // 他想让dep 中可以存watcher 还想让watcher中也存放dep 实现一个多对多的关系
        if(childOb){ // 数组的依赖收集
          childOb.dep.depend() // 数组也收集了当前渲染watcher
          dependArray(value) // 收集儿子的依赖
        }
      }
      return value
    },
    // 通知依赖更新
    set(newValue) {
      if (newValue === value) return
      observe(newValue)
      value = newValue
      dep.notify()
    }
  })
}

class Observer {
  constructor(data) {
    // 将用户的数据使用defineProperty重新定义
    this.dep = new Dep() // 此dep专门为数组而设定

    // 每个对象 包括数组都有一个__ob__属性 返回的是当前的observer
    Object.defineProperty(data, '__ob__', {
      get:()=>this
    })
    if (Array.isArray(data)){ // 数组进行劫持 重写push方法
      // 只能拦截数组的方法， 数组里的每一项 还需要取观测一下
      data.__proto__ = arrayMethods // 让数组通过原型链来查找我们自己编写的方法
      // 当调用数组的方法时 手动通知
      observerArray(data)
    } else {
      this.walk(data)
    }
  }

  walk(data) {
    const keys = Object.keys(data)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = data[key]
      defineReactive(data, key, value)
    }
  }
}

export default Observer