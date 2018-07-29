import jsonp from 'common/js/jsonp'
import {
  commonParams,
  options
} from './config'

/**
 * jsonp 抓取排行页数据
 * 接口（pc端）：https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_opt.fcg
 * 接口（移动端）：https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg
 * 提供方：https://y.qq.com/n/yqq/toplist/4.html
 */

export function getTopList () {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'
  const data = Object.assign({}, commonParams, {
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  })
  return jsonp(url, data, options)
}

/**
 * jsonp 抓取排行详情页数据
 * 接口：https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg
 * 提供方：https://y.qq.com/w/toplist.html?ADTAG=myqq&from=myqq&channel=10007100&id=4&type=top
 */

export function getMusicList (topid) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'

  const data = Object.assign({}, commonParams, {
    topid,
    needNewCode: 1,
    uin: 0,
    tpl: 3,
    page: 'detail',
    type: 'top',
    platform: 'h5'
  })

  return jsonp(url, data, options)
}
