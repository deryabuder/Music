<template>
  <div class="music-list">
    <!-- 返回按钮 -->
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <!-- 标题 -->
    <h1 class="title" v-html="title"></h1>
    <!-- 背景图区域 -->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <!-- 随机播放按钮 -->
        <div class="play" ref="playBtn" v-show="songs.length>0" @click='random'>
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <!-- 滚动区域 -->
    <scroll :data="songs" @scroll="scroll"
            :listen-scroll="listenScroll" :probe-type="probeType" class="list" ref="list">
      <div class="song-list-wrapper">
        <!-- 从父元素接收，再传给子组件 -->
        <song-list :songs="songs" :rank='rank' @select='selectItem'></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type='ecmascript-6'>
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import SongList from 'base/song-list/song-list'
import { prefixStyle } from 'common/js/dom'
import { mapActions } from 'vuex'
import { playlistMixin } from 'common/js/mixin'

const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')
export default {
  // 相当于将mixin中的方法插入到组件中，组件中同名的方法会覆盖mixin中的方法
  mixins: [playlistMixin],
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      scrollY: 0
    }
  },
  computed: {
    // 将style属性绑定这个变量
    bgStyle () {
      return `background-image:url(${this.bgImage})`
    }
  },
  // 实例创建完成
  created () {
    this.probeType = 3
    this.listenScroll = true
  },
  // 挂载完成
  mounted () {
    this.imageHeight = this.$refs.bgImage.clientHeight
    // 最高滚动位置 负值
    this.minTransalteY = -this.imageHeight + RESERVED_HEIGHT
    // 可滚动区域距离顶部的初始高度是图片的高度
    this.$refs.list.$el.style.top = `${this.imageHeight}px`
  },
  methods: {
    back () {
      this.$router.back()
    },
    random () {
      this.randomPlay({
        list: this.songs
      })
    },
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    scroll (pos) {
      // 是负值
      this.scrollY = pos.y
    },
    selectItem (item, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    // 语法糖， 调用actions中的selectPlay函数
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  watch: {
    scrollY (newVal) {
      // 起始位置的顶部是0，向上滚，滚动位置变为负值，控制歌单滚动不超过背景图的顶部位置
      let translateY = Math.max(this.minTransalteY, newVal)
      let scale = 1
      let zIndex = 0
      let blur = 0
      const percent = Math.abs(newVal / this.imageHeight)
      if (newVal > 0) {
        // 下拉扩大
        scale = 1 + percent
        zIndex = 10
      } else {
        // 上拉模糊
        blur = Math.min(20, percent * 20)
      }
      // backdrop-filter这个属性只有iso支持
      this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
      this.$refs.filter.style[backdrop] = `blur(${blur}px)`
      if (newVal < this.minTransalteY) {
        // 上拉超过顶部界限
        zIndex = 10
        this.$refs.bgImage.style.paddingTop = 0
        // 固定高度
        this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
        this.$refs.playBtn.style.display = 'none'
      } else {
        // 图像尺寸变大，撑开的高度也会变大
        this.$refs.bgImage.style.paddingTop = '70%'
        this.$refs.bgImage.style.height = 0
        // 播放按钮继续显示
        this.$refs.playBtn.style.display = ''
      }
      this.$refs.bgImage.style[transform] = `scale(${scale})`
      // 下拉和超过顶部高度的时候显示图片
      this.$refs.bgImage.style.zIndex = zIndex
    }
  },
  components: {
    Scroll,
    Loading,
    SongList
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.music-list {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;

  // position的值为absolute、fixed的元素脱离文档流
  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 50;

    .icon-back {
      display: block;
      // 空白处需要背景色，元素与内容的间隔
      padding: 10px;
      font-size: $font-size-large-x;  // 22px
      color: $color-theme;
    }
  }
  // 没有包裹，无需设置 padding
  .title {
    position: absolute;
    top: 0;
    z-index: 40;
    // 达到居中的效果
    left: 10%;
    width: 80%;
    np-wrap();
    text-align: center;
    // 通过设置行高达到文字垂直居中的效果
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
  }

  .bg-image {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 70%;
    // 属性用来设置 transform 变换的基点位置。默认情况下，基点位置为元素的中心点
    transform-origin: top;
    // 把背景图像扩展至足够大，以使背景图像完全覆盖背景区域。
    background-size: cover;

    .play-wrapper {
      position: absolute;
      bottom: 20px;
      z-index: 50;
      width: 100%;

      .play {
        box-sizing: border-box;
        width: 135px;
        padding: 7px 0;
        // 自身水平居中
        margin: 0 auto;
        // 包裹的元素水平居中
        text-align: center;
        border: 1px solid $color-theme;
        border-radius: 100px;
        font-size: 0;

        .icon-play {
          display: inline-block;
          vertical-align: middle;
          margin-right: 6px;
          font-size: $font-size-medium-x; // 16px
        }

        .text {
          display: inline-block;
          vertical-align: middle;
          font-size: $font-size-medium-x;
        }
      }
    }

    .filter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  .bg-layer {
    position: relative;
    height: 100%;
    background: $color-background;
  }

  .list {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    background: $color-background;

    .song-list-wrapper {
      padding: 20px 30px;
    }
    // 在list中居中显示
    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
