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
      arr: [[1], 1, 2]
    }
  },
  computed: {

  },
  watch: {
    msg(newValue, oldValue) {
      console.log(oldValue, newValue)
    }
  }
})
console.log(vm)
setTimeout(() => {
  // vm.msg = 'world'
  // vm.msg = 'world1'
  // vm.msg = 'world2'
  // vm.msg = 'world3'
  // vm.school.name = '1321'
  // vm.school.name = 'zf'

  // vm.arr[0].push(10)
  // vm.arr.push(100)
  vm.msg = 'world'
}, 1000)