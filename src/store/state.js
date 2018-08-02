import {
  playMode
} from 'common/js/config'

import {
  loadSearch,
  loadPlay,
  loadFavorite
} from 'common/js/cache'
// 原始数据
const state = {
  // 歌手信息
  singer: {},
  // 播放器播放状态
  playing: false,
  // 播放器展开状态
  fullScreen: false,
  // 播放列表
  playlist: [],
  // 顺序列表
  sequenceList: [],
  // 播放模式
  mode: playMode.sequence,
  // 当前播放索引
  currentIndex: -1,
  // 推荐页歌单
  disc: {},
  // 歌曲排行数据
  topList: {},
  // 搜索历史
  searchHistory: loadSearch(),
  // 播放历史
  playHistory: loadPlay(),
  // 我的收藏
  favoriteList: loadFavorite()
}
export default state
