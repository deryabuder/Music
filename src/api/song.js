import {
  commonParams
} from './config'
import axios from 'axios'

/**
 * axios 抓取歌词数据
 * 接口：https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg
 * 原始地址：https://y.qq.com/portal/player.html
 * 接口提供方使用了 referer:https://y.qq.com/portal/player.html
 * axios 结合 node.js 代理后端请求
 */

export function getLyric (mid) {
  const url = '/api/lyric'

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    g_tk: 67232076,
    pcachetime: +new Date(),
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
