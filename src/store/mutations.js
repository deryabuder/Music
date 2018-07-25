import * as types from './mutation-types'

// 通常 mutation 都有 mutation-type做关联
const mutations = {
  [types.SET_SINGER] (state, singer) {
    state.singer = singer
  }
}

export default mutations
