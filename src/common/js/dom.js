export function hasClass (el, className) {
  // 起始位置|空白符 + className + 结束位置或者空白符
  // 用于匹配 className
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
  // 用正则表达式去匹配元素className属性的属性值
  return reg.test(el.className)
}

export function addClass (el, className) {
  if (hasClass(el, className)) {
    return
  }
  // 添加新的类名的方式：先分割成数组，再添加，再连接成字符串
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

// 获取或设置data- 属性
// data-* 属性赋予我们在所有 HTML 元素上嵌入自定义 data 属性的能力。
export function getData (el, name, val) {
  const prefix = 'data-'
  // 判断自定义属性是否有属性值
  if (val) {
    return el.setAttribute(prefix + name, val)
  } else {
    return el.getAttribute(prefix + name)
  }
}

// 判断游览器内核，
// 创建div元素，并给元素添加style属性
let elementStyle = document.createElement('div').style

// 等于立即执行函数
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  // 判断是哪种浏览器内核
  // let in 对象得到的是key 数组得到的是item
  for (let key in transformNames) {
    // 判断elementStyle是否有 transformNames[key]属性
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }

  return false
})()

export function prefixStyle (style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }
  // 自动给style添加前缀
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
