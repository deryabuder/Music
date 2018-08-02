import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LEN = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LEN = 200

const FAVORITE_KEY = '_favorite_'
const FAVORITE_MAX_LEN = 200

// 将搜索历史或最近播放歌曲插入数组
function insertArray (arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  if (index === 0) {
    return
  }
  // 如果compare不是第0项，删除compare
  if (index > 0) {
    arr.splice(index, 1)
  }
  // 添加val到数组的开头
  arr.unshift(val)
  // 数组的长度不能大于maxLen
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

// 从数组中删除搜索历史或最近播放
function deleteFromArray (arr, compare) {
  // 如果compare在数组中的话，就删除
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

// 保存搜索历史
export function saveSearch (query) {
  //  localStorage
  //  storage.set(key,val)
  //  storage.get(key, def)
  // 当数组中存在和插入元素相同的元素时，如果不是第一条搜索记录，就删除数组中的元素，然后插入
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LEN)
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 删除搜索历史
export function deleteSearch (query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 清空搜索历史
export function clearSearch () {
  // remove(key)
  storage.remove(SEARCH_KEY)
  return []
}

// 获取搜索历史
export function loadSearch () {
  // get(key, def)
  // get storage with key, return def if not find
  return storage.get(SEARCH_KEY, [])
}

// 保存播放列表
export function savePlay (song) {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    // 返回数组中与song相同的item
    return song.id === item.id
  }, PLAY_MAX_LEN)
  storage.set(PLAY_KEY, songs)
  return songs
}

// 获取播放列表
export function loadPlay () {
  // get storage with key, return def if not find
  return storage.get(PLAY_KEY, [])
}

// 保存收藏到 localStorage
export function saveFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LEN)
  storage.set(FAVORITE_KEY, songs)
  return songs
}
// 从localstorage中删除收藏的歌曲
export function deleteFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}
// 从localstorage中获取收藏列表
export function loadFavorite () {
  return storage.get(FAVORITE_KEY, [])
}
