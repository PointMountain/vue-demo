import Vue from 'vue' // 会默认先查找source 目录下的vue文件夹

const vm = new Vue({
  el: '#app',
  data() {
    return {
      msg: 'hello',
      school: {
        name: 'zf',
        age: 10
      },
      arr: [{
        a: 1
      }, 1, 2]
    }
  },
  computed: {

  },
  watch: {

  }
})
console.log(vm)