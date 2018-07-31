import jsonp from 'common/js/jsonp'
import {
  commonParams,
  options
} from './config'
import axios from 'axios'

/**
 * jsonp 抓取推荐页轮播图数据
 * 接口：https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg
 */
export function getRecommend () {
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

  const data = Object.assign({}, commonParams, {
    platform: 'h5',
    uin: 0,
    needNewCode: 1
  })

  return jsonp(url, data, options)
}

/**
 * axios 抓取推荐页列表数据
 * 接口：https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg
 * 接口提供方使用了 referer:https://y.qq.com/portal/playlist.html
 * axios 结合 node.js 代理后端请求
 * 这个借口请求头里有host和referer，后端会校样host和referer，因此使用jsonp访问不到
 */
export function getDiscList () {
  const url = '/api/getDiscList'

  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

/**
 * jsonp 抓取推荐页歌单数据
 * 接口：https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg
 * 提供方：https://y.qq.com/n/yqq/playlist/1471714611.html#
 */
export function getSongList (disstid) {
  const url = '/api/getcdInfo'

  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    // 一定要加这个，不然返回的是回调函数
    format: 'json'
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
