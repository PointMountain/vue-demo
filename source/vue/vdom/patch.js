// 此文件除了第一次的初始化渲染之外
export function render(vnode, container) { // 让虚拟节点 渲染成真实节点
  const el = createElm(vnode)
  container.appendChild(el)
  return el
}

// 创建真实节点
function createElm(vnode) {
  const {
    tag,
    children,
    key,
    props,
    text
  } = vnode
  if (typeof tag === 'string') {
    // 标签 一个虚拟节点 对应着他的真实节点 主要是做一个映射关系
    vnode.el = document.createElement(tag)
    updateProperties(vnode)
    children.forEach(child => { // child是虚拟节点
      return render(child, vnode.el) // 递归渲染当前孩子列表
    })
  } else {
    // 文本
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}
// 更新属性也会调用此方法
function updateProperties(vnode, oldProps = {}) {
  let newProps = vnode.props || {} // 获取当前节点中的属性
  let el = vnode.el

  let newStyle = newProps.style || {}
  let oldStyle = oldProps.style || {}
  // 因为标签复用了 所以要进行比较
  for (const key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = ''
    }
  }
  // 如果下次更新时 应该用新的属性 来更新老的节点
  // 如果老的中有属性 新的中没有
  for (const key in oldProps) {
    if (!newProps[key]) {
      delete el[key]
    }
  }

  // 先考虑下 以前有没有
  for (const key in newProps) {
    if (key === 'style') {
      for (const styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName]
      }
    } else if (key === 'class') {
      el.className = newProps[key]
    } else {
      el[key] = newProps[key]
    }
  }
}

export function patch(oldVnode, newVnode) {
  // 1) 先比对 标签一样不一样
  if (oldVnode.tag !== newVnode.tag) {
    oldVnode.el.parentNode.replaceChild(createElm(newVnode), oldVnode.el)
  }
  // 2)比较文本 标签一样 可能都是undefined
  if (!oldVnode.tag) {
    if (oldVnode.text !== newVnode.text) {
      oldVnode.el.textContent = newVnode.text
    }
  }
  // 标签一样 可能属性不一样
  let el = newVnode.el =  oldVnode.el // 标签一样复用即可
  updateProperties(newVnode, oldVnode.props)

  // 必须要有一个根节点
  // 比较孩子
  let oldChildren = oldVnode.children || []
  let newChildren = newVnode.children || []

  // 老的有孩子 新的有孩子
  if(oldChildren.length > 0 && newChildren.length > 0){
    updateChildren(el, oldChildren, newChildren)
  }else if(oldChildren.length > 0){ // 老的有孩子 新的没孩子
    el.innerHTML = ''
  }else if(newChildren.length > 0){ // 老的没孩子 新的有孩子
    for (let i = 0; i < newChildren.length; i++) {
      const child = newChildren[i]
      el.appendChild(createElm(child)) // 将当前新的儿子 丢到老节点中即可
    }
  }
  return el
}

function isSameVnode(oldVnode, newVnode) {
  // 如果两个标签和key一样 则认为是用一个节点 虚拟节点一样就可以复用真实节点
  return (oldVnode.tag === newVnode.tag) && (oldVnode.key === newVnode.key)
}

function updateChildren(parent, oldChildren, newChildren){
  // vue增加了很多优化策略 因为浏览器中操作dom最常见的方法是 开头或者结尾插入
  // 涉及到正序和倒序
  // 双指针
  let oldStartIndex = 0 // 老的索引开始
  let oldStartVnode = oldChildren[0] // 老的节点开始
  let oldEndIndex = oldChildren.length - 1
  let oldEndVnode = oldChildren[oldEndIndex]

  let newStartIndex = 0 // 新的索引开始
  let newStartVnode = newChildren[0] // 新的节点开始
  let newEndIndex = newChildren.length - 1
  let newEndVnode = newChildren[newEndIndex]

  function makeIndexByKey(children) {
    let map = {}
    children.forEach((item, index) => {
      map[item.key] = index
    })
    return map
  }
  let map = makeIndexByKey(oldChildren)
  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 倒序 正序
    if(!oldStartVnode){
      oldStartVnode = oldChildren[++oldStartVnode]
    }else if(!oldEndVnode){
      oldEndVnode = oldChildren[--oldEndIndex]
    }else if(isSameVnode(oldStartVnode, newStartVnode)){ // 先看前面是否一样
      patch(oldStartVnode, newStartVnode) // 用新的属性来更新老的属性
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    }else if(isSameVnode(oldEndVnode, newEndVnode)){ // 先后面比较看是否一样
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if(isSameVnode(oldStartVnode, newEndVnode)){
      patch(oldStartVnode, newEndVnode)
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    } else if(isSameVnode(oldEndVnode, newStartVnode)){
      patch(oldEndVnode, newStartVnode)
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    } else {
      // 两个列表 乱序 不复用
      // 会先拿新节点的第一项 去老节点中匹配 如果匹配不到直接将节点抛入到老节点开头的前面，如果能查找到 则直接移动老节点
      // 可能老节点中还有剩余，则直接删除老节点中的剩余节点
      let moveIndex = map[newStartVnode.key]
      if(moveIndex == undefined){
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      }else{
        let moveVnode = oldChildren[moveIndex]
        patch(moveVnode, newStartVnode)
        oldChildren[moveIndex] = undefined
        parent.insertBefore(moveVnode.el, oldStartVnode.el)
      }
      // 要将新阶段的指针向后移动
      newStartVnode = newChildren[++newStartIndex]
    }
  }
  if (newStartIndex <= newEndIndex){ // 如果到最后还剩余 需要将剩余的插入
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 要插入的元素
      let ele = newChildren[newEndIndex + 1] == null ? null : newChildren[newEndIndex + 1].el
      parent.insertBefore(createElm(newChildren[i]), ele)
      // 可能是往前面插入 也有可能是往后面插入
      // insertBefore(插入的元素, null) insertBefore(null) === appendChild
      // parent.appendChild(createElm(newChildren[i]))
    }
    parent.appendChild
  }

  if(oldStartIndex <= oldEndIndex){
    for (let i = oldStartIndex; i < oldChildren.length; i++) {
      let child = oldChildren[i]
      if(child != undefined){
        parent.removeChild(child.el)
      }
    }
  }
  // 循环的时候 尽量不要用索引作为key 可能会导致重新创建当前元素的所有子元素
}