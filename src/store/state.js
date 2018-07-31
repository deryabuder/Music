import {
  playMode
} from 'common/js/config'

import {
  loadSearch,
  loadPlay
} from 'common/js/cache'
// 原始数据
const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  // 播放列表
  playlist: [],
  // 顺序列表
  sequenceList: [],
  // 播放模式
  mode: playMode.sequence,
  // 当前播放索引
  currentIndex: -1,
  disc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay()
}
export default state
