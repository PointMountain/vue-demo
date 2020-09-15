import Vue from 'vue'

const vm = new Vue({
  el: '#app',
  data() {
    return {
      msg: 'hello zf'
    }
  },
  render(h) {
    return h('p', {
      id: 'a'
    }, this.msg)
  }
})
console.log(vm)
setTimeout(() => {
  vm.msg = 'hello world'
}, 1000)