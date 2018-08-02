// 如果一个动作中多次改变mutation，就需要封装在action中
// 根级别的 action
// 封装复杂的 mutations
import * as types from './mutation-types'
import {
  shuffle
} from 'common/js/util'
import {
  playMode
} from 'common/js/config'

import {
  saveSearch,
  clearSearch,
  deleteSearch,
  savePlay,
  saveFavorite,
  deleteFavorite
} from 'common/js/cache'

function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}
// 选择歌曲播放
export const selectPlay = function ({
  commit,
  state
}, {
  list,
  index
}) {
  // 使用commit提交mutation来修改state
  commit(types.SET_SEQUENCE_LIST, list)
  // 避免随机播放时，点击歌单，播放歌曲乱序
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    // 顺序列表的歌，对应randomList
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}
// 随机播放全部按钮
export const randomPlay = function ({
  commit
}, {
  list
}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  // 从randomlist的第一个元素播放
  commit(types.SET_CURRENT_INDEX, 0)
}

/**
 * 保存搜索历史
 */
export const saveSearchHistory = function ({
  commit
}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}
/**
 * 删除单个搜索历史
 */
export const deleteSearchHistory = function ({
  commit
}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}
/**
 * 删除全部搜索历史
 */
export const clearSearchHistory = function ({
  commit
}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

/**
 * 新增歌曲到播放列表
 */
export const insertSong = function ({
  commit,
  state
}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否有待插入的歌曲并返回其索引
  let fpIndex = findIndex(playlist, song)
  // 因为是插入歌曲，所以索引+1
  currentIndex++
  // 插入这首歌到当前索引位置
  playlist.splice(currentIndex, 0, song)
  // 如果已经包含了这首歌
  if (fpIndex > -1) {
    // 如果当前插入的序号大于列表中的序号
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1)
    }
  }

  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  let fsIndex = findIndex(sequenceList, song)
  sequenceList.splice(currentSIndex, 0, song)
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

/**
 * 从最近播放中删除歌曲
 */

export const deleteSong = function ({
  commit,
  state
}, song) {
  // 获得播放列表的副本
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playlist, song)
  // 从播放列表中删除song
  playlist.splice(pIndex, 1)
  let sIndex = findIndex(sequenceList, song)
  // 从顺序列表中删除song
  sequenceList.splice(sIndex, 1)
  // 如果当前索引比删除歌曲的索引大或删除的是最后一首歌
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }

  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)

  // 如果播放列表长度不为0，则切换为播放状态
  if (!playlist.length) {
    commit(types.SET_PLAYING_STATE, false)
  } else {
    commit(types.SET_PLAYING_STATE, true)
  }
}
/**
 * 删除最近播放中所有的歌
 */
export const deleteSongList = function ({
  commit
}) {
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_PLAYING_STATE, false)
}

export const savePlayHistory = function ({
  commit
}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveFavoriteList = function ({
  commit
}, song) {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function ({
  commit
}, song) {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}
