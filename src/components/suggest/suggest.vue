<template>
  <scroll ref="suggest"
          class="suggest"
          :data="result"
          :pullup="pullup"
          :beforeScroll="beforeScrollData"
          @scrollToEnd="searchMore"
          @beforeScroll="listScroll"
  >
    <ul class="suggest-list">
      <li @click="selectItem(item)" class="suggest-item" v-for="(item, index) of result" :key='index'>
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import NoResult from 'base/no-result/no-result'
import { search } from 'api/search'
import { ERR_OK } from 'api/config'
import { createSong } from 'common/js/song'
import { mapMutations, mapActions } from 'vuex'
import Singer from 'common/js/singer'

const TYPE_SINGER = 'singer'
const perpage = 20

export default {
  props: {
    // 是否显示歌手
    showSinger: {
      type: Boolean,
      default: true
    },
    // 接受的检索值
    query: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      // 当前检索页数，用于下拉加载
      page: 1,
      pullup: true,
      beforeScrollData: true,
      // 标志位。是否加载完
      hasMore: true,
      // 接受检索结果
      result: []
    }
  },
  methods: {
    // 给父亲用
    refresh () {
      this.$refs.suggest.refresh()
    },
    search () {
      this.page = 1
      this.hasMore = true
      this.$refs.suggest.scrollTo(0, 0)
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this.result = this._genResult(res.data)
          this._checkMore(res.data)
        }
      })
    },
    searchMore () {
      if (!this.hasMore) {
        return
      }
      this.page++
      search(this.query, this.page, this.showSinger, perpage).then((res) => {
        if (res.code === ERR_OK) {
          this.result = this.result.concat(this._genResult(res.data))
          this._checkMore(res.data)
        }
      })
    },
    // 滚动前触发事件
    listScroll () {
      this.$emit('listScroll')
    },
    selectItem (item) {
      // 点击搜索结果中的歌曲或歌手
      if (item.type === TYPE_SINGER) {
        // 格式化歌手信息
        const singer = new Singer({
          id: item.singermid,
          name: item.singername
        })
        // 路由跳转逻辑
        this.$router.push({
          path: `/search/${singer.id}`
        })
        // 添加歌手到歌手列表
        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
      this.$emit('select', item)
    },
    // 搜索结果展示的文字部分
    getDisplayName (item) {
      if (item.type === TYPE_SINGER) {
        return item.singername
      } else {
        return `${item.name}-${item.singer}`
      }
    },
    // 搜索结果对应的图标样式
    getIconCls (item) {
      if (item.type === TYPE_SINGER) {
        return 'icon-mine'
      } else {
        return 'icon-music'
      }
    },
    // 重组 res.data 数据（歌手数据和歌曲数据）
    _genResult (data) {
      let ret = []
      if (data.zhida && data.zhida.singerid) {
        // 解构赋值
        ret.push({ ...data.zhida, ...{ type: TYPE_SINGER } })
      }
      if (data.song) {
        ret = ret.concat(this._normalizeSongs(data.song.list))
      }
      return ret
    },
    // 格式化歌曲信息
    _normalizeSongs (list) {
      let ret = []
      list.forEach((musicData) => {
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    // 什么时候不上拉刷新
    _checkMore (data) {
      const song = data.song
      // 没有数据或最后一页
      if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
        this.hasMore = false
      }
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    query (newQuery) {
      this.search(newQuery)
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
}

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;
    }

    .icon {
      flex: 0 0 30px;
      width: 30px;

      [class^='icon-'] {
        font-size: 14px;
        color: $color-text-d;
      }
    }

    .name {
      flex: 1;
      font-size: $font-size-medium;
      color: $color-text-d;
      overflow: hidden;

      .text {
        no-wrap();
      }
    }
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
