import originalJSONP from 'jsonp'

export function param (data) {
  let url = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    // ES6模板字面量中的制造替换位
    url += `&${k}=${encodeURIComponent(value)}`
  }
  // 为了前面的判断
  return url ? url.substring(1) : ''
}

// data是object
export default function jsonp (url, data, opts) {
  url += ((url.indexOf('?') === -1) ? '?' : '&') + param(data)
  // 参数是执行器，执行器的参数是完成处理函数和拒绝处理函数
  return new Promise((resolve, reject) => {
    originalJSONP(url, opts, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}
