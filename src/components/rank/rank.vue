<template>
  <div class='rank' ref='rank'>
    <scroll :data='topList' class='toplist' ref='toplist'>
      <ul>
        <li class='item' v-for='item in topList' :key='item.id' @click='selectItem(item)'>
          <div class='icon'>
            <img width='100' height='100' v-lazy='item.picUrl'/>
          </div>
          <ul class='songlist'>
            <li class='song' v-for='(song, index) in item.songList' :key='index'>
              <span>{{index + 1}}</span>
              <span>{{song.songname}}-{{song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class='loading-container' v-show='!topList.length'>
        <loading></loading>
      </div>
    </scroll>
     <!-- router-view 当做是存放二级路由的容器，它渲染的组件是你使用 vue-router 指定的 -->
    <router-view></router-view>
  </div>
</template>

<script type='ecmascript-6'>
import { getTopList } from 'api/rank'
import { ERR_OK } from 'api/config'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import { playlistMixin } from 'common/js/mixin'
import { mapMutations } from 'vuex'
export default {
  mixins: [playlistMixin],
  created () {
    // 确保dom渲染完成
    setTimeout(() => {
      this._getTopList()
    }, 1000)
  },
  data () {
    return {
      topList: []
    }
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length ? '60px' : ''
      this.$refs.rank.style.bottom = bottom
      // dom结构发生变化，需要手动去刷新滚动页面
      this.$refs.toplist.refresh()
    },
    selectItem (item) {
      // 跳转到二级路由，并传入id作为path
      this.$router.push({
        path: `/rank/${item.id}`
      })
      // 将topList写入state中
      this.setTopList(item)
    },
    _getTopList () {
      getTopList().then((res) => {
        if (res.code === ERR_OK) {
          this.topList = res.data.topList
        }
      })
    },
    // mapMutations是一个对象，是组件方法到Mutations方法的映射
    ...mapMutations({
      setTopList: 'SET_TOP_LIST'
    })
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.rank {
  // 父容器高度固定
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  // 子容器溢出隐藏
  .toplist {
    height: 100%;
    overflow: hidden;

    .item {
      // 左右弹性布局
      display: flex;
      // 元素与元素之间
      margin: 0 20px;
      padding-top: 20px;
      height: 100px;

      // &表示父元素
      &:last-child {
        padding-bottom: 20px;
      }

      .icon {
        flex: 0 0 100px;
        width: 100px;
        height: 100px;
      }

      .songlist {
        flex: 1;
        // 上下弹性布局
        display: flex;
        flex-direction: column;
        // 在垂直方向上居中
        justify-content: center;
        padding: 0 20px;
        height: 100px;
        overflow: hidden;
        background: $color-highlight-background;
        color: $color-text-d;
        font-size: $font-size-small;

        .song {
          no-wrap();
          line-height: 26px;
        }
      }
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
