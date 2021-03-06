<!-- 添加歌曲到队列 组件 -->
<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <!-- 头部 -->
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <!-- 搜索框 -->
      <div class="search-box-wrapper">
        <search-box ref="searchBox" @query="onQueryChange" placeholder="搜索歌曲"></search-box>
      </div>
      <!-- 切换及其内容 -->
      <div class="shortcut" v-show="!query">
        <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></switches>
        <div class="list-wrapper">
          <!-- 最近播放 -->
          <scroll ref="songList" v-if="currentIndex===0" class="list-scroll" :data="playHistory">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong">
              </song-list>
            </div>
          </scroll>
          <!-- 搜索历史，点击搜索历史，将搜索框内容重置为点击的内容-->
          <scroll :refreshDelay="refreshDelay" ref="searchList" v-if="currentIndex===1" class="list-scroll"
                  :data="searchHistory">
            <div class="list-inner">
              <search-list @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <!--搜索结果，点击之后，子组件会添加歌曲到播放列表，父组件搜索内容保存在搜索历史-->
      <div class="search-result" v-show="query">
        <suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script type='text/ecmascript-6'>
import SearchBox from 'base/search-box/search-box'
import SongList from 'base/song-list/song-list'
import SearchList from 'base/search-list/search-list'
import Scroll from 'base/scroll/scroll'
import Switches from 'base/switches/switches'
import TopTip from 'base/top-tip/top-tip'
import Suggest from 'components/suggest/suggest'
import { searchMixin } from 'common/js/mixin'
import { mapGetters, mapActions } from 'vuex'
import Song from 'common/js/song'

export default {
  mixins: [searchMixin],
  data () {
    return {
      // 默认不展示添加歌曲页面
      showFlag: false,
      showSinger: false,
      currentIndex: 0,
      songs: [],
      switches: [
        {
          name: '最近播放'
        },
        {
          name: '搜索历史'
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'playHistory',
      'searchHistory'
    ])
  },
  methods: {
    // 展示添加歌曲页面，给父组件使用
    show () {
      this.showFlag = true
      setTimeout(() => {
        // 因为是v-if控制切换，因此需要刷新scroll
        if (this.currentIndex === 0) {
          this.$refs.songList.refresh()
        } else {
          this.$refs.searchList.refresh()
        }
      }, 20)
    },
    // 点击按钮，隐藏当前页面
    hide () {
      this.showFlag = false
    },
    // 点击最近播放，插入歌曲到顺序列表和随机列表
    selectSong (song, index) {
      if (index !== 0) {
        // 从搜索历史中添加歌曲
        this.insertSong(new Song(song))
        this.$refs.topTip.show()
      }
    },
    // 点击搜索建议，保存到搜索历史中
    selectSuggest () {
      this.$refs.topTip.show()
      this.saveSearch()
    },
    // 子组件发了点击事件，父组件切换显示的当前内容
    switchItem (index) {
      this.currentIndex = index
    },
    ...mapActions([
      'insertSong'
    ])
  },
  components: {
    SearchBox,
    SongList,
    SearchList,
    Scroll,
    Switches,
    TopTip,
    Suggest
  }
}

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.add-song {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 200;
  background: $color-background;

  &.slide-enter-active, &.slide-leave-active {
    transition: all 0.3s;
  }

  &.slide-enter, &.slide-leave-to {
    transform: translate3d(100%, 0, 0);
  }

  .header {
    position: relative;
    height: 44px;
    text-align: center;

    .title {
      line-height: 44px;
      font-size: $font-size-large;
      color: $color-text;
    }

    .close {
      position: absolute;
      top: 0;
      right: 8px;

      .icon-close {
        display: block;
        padding: 12px;
        font-size: 20px;
        color: $color-theme;
      }
    }
  }

  .search-box-wrapper {
    margin: 20px;
  }

  .shortcut {
    .list-wrapper {
      position: absolute;
      top: 165px;
      bottom: 0;
      width: 100%;

      .list-scroll {
        height: 100%;
        overflow: hidden;

        .list-inner {
          padding: 20px 30px;
        }
      }
    }
  }

  .search-result {
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  }

  .tip-title {
    text-align: center;
    padding: 18px 0;
    // 清除内联元素之间的间隙
    font-size: 0;

    .icon-ok {
      font-size: $font-size-medium;
      color: $color-theme;
      margin-right: 4px;
    }

    .text {
      font-size: $font-size-medium;
      color: $color-text;
    }
  }
}
</style>
