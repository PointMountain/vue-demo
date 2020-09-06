// ?: 匹配不捕获 不捕获当前的分组
// + 至少一个
// ? 尽可能少匹配
const defaultRE = /\{\{((?:.|\r?\n)+?)\}\}/g
export const util = {
  getValue(vm, expr) { // school.name
    let keys = expr.split('.')
    return keys.reduce((memo, current) => {
      memo = memo[current]
      return memo
    }, vm)
  },
  compilerText(node, vm) { // 编译文本 替换{{}}
    if(!node.expr){
      node.expr = node.textContent // 给节点增加一个自定义属性 为了方便后续更新操作
    }
    node.textContent = node.expr.replace(defaultRE, function (...args) {
      return JSON.stringify(util.getValue(vm, args[1]))
    })
  }
}

export function compiler(node, vm) { // node就是文档碎片
  let childNodes = node.childNodes;
  [...childNodes].forEach(child => { // 一种是元素 一种是文本
    if (child.nodeType === 1) { // 1元素 3表示文本
      compiler(child, vm) // 编译当前元素的孩子节点
    } else if (child.nodeType === 3) {
      util.compilerText(child, vm)
    }
  });
}