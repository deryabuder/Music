import jsonp from 'common/js/jsonp'
import {
  commonParams,
  options
} from './config'

import axios from 'axios'
/**
 * jsonp 抓取热门搜索数据
 * 接口：https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg
 * 提供方：https://m.y.qq.com/#search
 */
export function getHotKey () {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

  const data = Object.assign({}, commonParams, {
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  })
  return jsonp(url, data, options)
}

/**
 * jsonp 抓取搜索检索数据
 * 接口：https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp
 * 提供方：https://m.y.qq.com/#search
 */

export function search (query, page, zhida, perpage) {
  const url = '/api/getsearchList'

  const data = Object.assign({}, commonParams, {
    w: query,
    p: page,
    catZhida: zhida ? 1 : 0,
    uin: 0,
    platform: 'h5',
    needNewCode: 1,
    zhidaqu: 1,
    t: 0,
    flag: 1,
    ie: 'utf-8',
    sem: 1,
    aggr: 0,
    perpage,
    n: 20,
    remoteplace: 'txt.mqq.all',
    _: +new Date(),
    format: 'json'
  })

  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
