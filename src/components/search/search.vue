<template>
  <div class="search">
    <div class="search-box-wrapper">
      <!-- 检索值由子组件searchbox传递给父组件 -->
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <scroll :refreshDelay="refreshDelay" ref="shortcut" class="shortcut" :data="shortcut">
        <div>
          <!-- 热门搜索 -->
          <div class='hot-key'>
            <h1 class='title'>热门搜索</h1>
            <ul>
              <li @click='addQuery(item.k)' class='item' v-for='item in hotKey' :key='item.n'>
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
           <!-- 搜索历史 -->
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span @click="showConfirm" class="clear">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <!-- 搜索结果 -->
    <div class="search-result" v-show="query" ref="searchResult">
      <!-- @从子组件接收的事件，:传递给子组件的数据-->
      <suggest @listScroll="blurInput" @select="saveSearch" ref="suggest" :query="query" :showSinger='showSinger'></suggest>
    </div>
    <!-- 清空弹窗 -->
    <confirm ref="confirm" @confirm="clearSearchHistory" text="是否清空所有搜索历史" confirmBtnText="清空"></confirm>
    <router-view></router-view>
  </div>

</template>

<script>
import SearchBox from 'base/search-box/search-box'
import SearchList from 'base/search-list/search-list'
import Scroll from 'base/scroll/scroll'
import Confirm from 'base/confirm/confirm'
import Suggest from 'components/suggest/suggest'
import { getHotKey } from 'api/search'
import { ERR_OK } from 'api/config'
import { playlistMixin, searchMixin } from 'common/js/mixin'
import { mapGetters, mapActions } from 'vuex'

export default {
  mixins: [playlistMixin, searchMixin],
  data () {
    return {
      hotKey: [],
      query: '',
      showSinger: true,
      refreshDelay: 100
    }
  },
  computed: {
    ...mapGetters(['searchHistory']),
    // scroll绑定的data，是热门搜索数组和搜索历史拼接后的数组
    shortcut () {
      return this.hotKey.concat(this.searchHistory)
    }
  },
  created () {
    this._getHotKey()
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      // 给搜索结果页面添加bottom
      this.$refs.searchResult.style.bottom = bottom
      // 刷新dom
      this.$refs.suggest.refresh()
      // 给搜索页面添加bottom
      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.shortcut.refresh()
    },
    // 子组件将监听到的query的变化发送给父组件，父组件将其保存在搜索历史中
    onQueryChange (query) {
      this.query = query
    },
    // 点击删除按钮，会出现是否删除搜索历史的确认框
    showConfirm () {
      this.$refs.confirm.show()
    },
    // 当向下滚动搜索结果时，让搜索框失去焦点
    blurInput () {
      this.$refs.searchBox.blur()
    },
    // 当点击热门或搜索历史时，将其添加到搜索框
    addQuery (k) {
      this.$refs.searchBox.setQuery(k)
    },
    // 逐项删除搜索历史
    deleteSearchHistory (item) {
      this.deleteSearchHistory(item)
    },
    // 点击搜索结果保存在本地
    saveSearch () {
      this.saveSearchHistory(this.query)
    },
    confirm () {
      this.clearSearchHistory()
    },
    _getHotKey () {
      getHotKey().then((res) => {
        if (res.code === ERR_OK) {
          // 只取前10条热门数据
          this.hotKey = res.data.hotkey.slice(0, 10)
        }
      })
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
      'clearSearchHistory'
    ])
  },
  watch: {
    // 解决添加歌曲后不能滚动的问题
    // 监听query的变化，从而监听shortcut的变化，从而对scroll滚动的数据进行刷新
    query (newQuery) {
      if (!newQuery) {
        setTimeout(() => {
          this.$refs.shortcut.refresh()
        }, 20)
      }
    }
  },
  components: {
    SearchBox,
    SearchList,
    Scroll,
    Suggest,
    Confirm
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.search {
  .search-box-wrapper {
    // 元素与元素之间
    margin: 20px;
  }

  .shortcut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;

    .shortcut {
      height: 100%;
      overflow: hidden;

      .hot-key {
        margin: 0 20px 20px 20px;

        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        }

        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }

      .search-history {
        position: relative;
        margin: 0 20px;

        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;

          .text {
            flex: 1;
          }

          .clear {
            extend-click();

            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
    }
  }

  .search-result {
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;
  }
}
</style>
