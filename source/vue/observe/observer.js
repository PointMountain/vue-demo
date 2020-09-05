import { observe } from './index'
import { arrayMethods, observerArray } from './array'
import Dep from './dep'

export function defineReactive(data, key, value) { // 定义响应式的数据变化
  // vue不支持ie8 及 ie8以下的浏览器

  // 如果value依旧是一个对象的话，需要深度观察
  observe(value)  // 递归观察 {} arr [1, 2, 3]
  let dep = new Dep() // dep里可以收集依赖 收集的是watcher
  Object.defineProperty(data, key, {
    get() {
      if(Dep.target){ // 这次有值用的是渲染watcher
        // 希望存入的watcher 不能重复 否则会造成更新时多次渲染
        dep.depend() // 他想让dep 中可以存watcher 还想让watcher中也存放dep 实现一个多对多的关系
      }
      console.log('获取数据')
      return value
    },
    set(newValue) {
      if (newValue === value) return
      observe(newValue)
      console.log('设置数据')
      value = newValue
      dep.notify()
    }
  })
}

class Observer {
  constructor(data) {
    // 将用户的数据使用defineProperty重新定义

    if (Array.isArray(data)){ // 数组进行劫持 重写push方法
      // 只能拦截数组的方法， 数组里的每一项 还需要取观测一下
      data.__proto__ = arrayMethods // 让数组通过原型链来查找我们自己编写的方法
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