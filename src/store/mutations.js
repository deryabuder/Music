import * as types from './mutation-types'

// 通常 mutation 都有 mutation-type做关联
// 在某一个动作会触发多个mutation时，用action对mutation进行封装
// 设置 state 中的数据
const matutaions = {
  [types.SET_SINGER] (state, singer) {
    state.singer = singer
  },
  // 布尔值用flag
  [types.SET_PLAYING_STATE] (state, flag) {
    state.playing = flag
  },
  [types.SET_FULL_SCREEN] (state, flag) {
    state.fullScreen = flag
  },
  [types.SET_PLAYLIST] (state, list) {
    state.playlist = list
  },
  [types.SET_SEQUENCE_LIST] (state, list) {
    state.sequenceList = list
  },
  [types.SET_PLAY_MODE] (state, mode) {
    state.mode = mode
  },
  [types.SET_CURRENT_INDEX] (state, index) {
    state.currentIndex = index
  }
}

export default matutaions
