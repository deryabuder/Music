<template>
  <div class="player" v-show="playlist.length>0">
    <!-- v-if 是动态地向DOM树内添加或者删除DOM元素; v-show 是通过设置DOM元素的display样式属性控制显隐 -->
    <!-- v-if有更高的切换消耗，v-show有更高的初始渲染消耗 -->
    <!-- 正常的播放器 -->
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
         <!-- 背景图 -->
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <!-- 顶部 -->
        <div class='top'>
          <!-- 返回按钮 -->
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
         <!-- 中部，阻止默认事件-->
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <!-- 唱片 -->
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <!-- 当前歌词 -->
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <!-- 歌词显示页面 -->
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <!-- 每句歌词都被放在p标签中 -->
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum ===index}"
                   v-for="(line,index) in currentLyric.lines" :key='index'>{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <!-- 底部操作区 -->
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <!-- 播放进度 -->
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
             <!-- 进度条组件 -->
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <!-- 歌曲的总时间 -->
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
           <!-- 底部操作区 -->
          <div class="operators">
            <div class="icon i-left">
              <i :class="iconMode" @click="changeMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class='icon' @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- 最小化的播放器 -->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
          <!-- 里面的dom会被作为子组件的slot -->
          <!-- 阻止冒泡 -->
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <!-- 是否打开播放列表 -->
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <play-list ref='playlist'></play-list>
    <!-- 播放器 -->
    <!-- oncanplay加载就绪就触发 onplay开始播放时触发 -->
    <audio ref="audio" :src="currentSong.url" @play="ready" @error="error" @timeupdate="updateTime"
           @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
// 从vuex取数据到组件中
import { mapGetters, mapMutations, mapActions } from 'vuex'
// 使用JavaScript在浏览器中动态生成CSS关键帧动画
import animations from 'create-keyframe-animation'
import { prefixStyle } from 'common/js/dom'
// 进度条
import ProgressBar from 'base/progress-bar/progress-bar'
// 带有进度的播放按钮
import ProgressCircle from 'base/progress-circle/progress-circle'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
// 歌词解析插件
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import PlayList from 'components/playlist/playlist'
import { playerMixin } from 'common/js/mixin'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
export default {
  mixins: [playerMixin],
  data () {
    return {
      // 标志位，保证了不会发生快速点击时dom没有成功渲染的问题
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: ''
    }
  },
  computed: {
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    // 播放器播放暂停图标的切换
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    // 最小化播放器的播放暂停图标切换
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    // 改变最小化播放器播放模式的图标样式
    iconMode () {
      // 比较的是数字
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    // 当歌曲没有就绪时，将上一首 下一首 切换播放状态按钮设置为无效
    disableCls () {
      return this.songReady ? '' : 'disable'
    },
    // 播放比例， 要传递给子组件progress.vue
    percent () {
      return this.currentTime / this.currentSong.duration
    },
    // 调用getter中的函数，从state中获取数据
    // song.list触发点击事件，发送给父组件music-list,父组件调用actions方法，将数据传给state
    ...mapGetters([
      'fullScreen',
      'playlist',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      // 根据 sequenceList和播放模式得到playlist
      'sequenceList',
      'favoriteList'
    ])
  },
  created () {
    this.touch = {}
  },
  methods: {
    // 点击返回键，切换为最小化播放器模式
    back () {
      this.setFullScreen(false)
    },
    // 点击最小化播放器则切换全屏播放模式
    open () {
      this.setFullScreen(true)
    },
    // 进入全屏模式的转换
    enter (el, done) {
      const { x, y, scale } = this._getPosAndScale()
      // 圆唱片从左下角移动到正常位置，先变大，然后边小
      let animation = {
        // 初始值
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        // 60%
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      }
      // 注册动画
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      // 运行动画
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    // 移除动画
    afterEnter () {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    // 离开全屏模式
    leave (el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      // 解构赋值
      const { x, y, scale } = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    // 离开全屏模式后，移除动画
    afterLeave () {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    // 切换播放状态
    togglePlaying () {
      if (!this.songReady) {
        return
      }
      // 歌曲切换播放状态时，歌词也应该切换相应的状态
      this.setPlayingState(!this.playing)
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    // 当前歌曲播放结束后的执行的操作
    end () {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop () {
      // 循环播放，播放时间设置为0，歌词重定位到第一句
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      this.setPlayingState(true)
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    next () {
      if (!this.songReady) {
        return
      }
      // 列表只有一首歌时，执行循环播放
      if (this.playlist.length === 1) {
        this.loop()
        return
      } else {
        let index = this.currentIndex + 1
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      this.songReady = false
    },
    prev () {
      if (!this.songReady) {
        return
      }
      // 列表只有一首歌时，执行循环播放
      if (this.playlist.length === 1) {
        this.loop()
        return
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      this.songReady = false
    },
    ready () {
      this.songReady = true
      this.savePlayHistory(this.currentSong)
    },
    error () {
      // 歌曲加载失败时
      this.songReady = true
    },
    // timeupdate 事件在音频/视频（audio/video）的播放位置发生改变时触发
    // 获取当前播放时间
    updateTime (e) {
      this.currentTime = e.target.currentTime
    },
    // 重新设置播放时间和歌曲总时长
    format (interval) {
      // 向下取整
      interval = interval | 0
      const minute = interval / 60 | 0
      const second = this._pad(interval % 60) // 在秒前补零，保证是两位数
      return `${minute}:${second}`
    },
    // 拖动进度条时，改变当前播放时间和歌词的位置
    onProgressBarChange (percent) {
      const currentTime = this.currentSong.duration * percent
      this.$refs.audio.currentTime = currentTime
      if (!this.playing) {
        this.togglePlaying()
      }
      if (this.currentLyric) {
        // 根据当前播放时间来确定单词
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    changeMode () {
      // 改变 mode 对应的数字，从而改变 mode 对应的图标
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      // 改变模式，其实是修改播放列表playlist []
      if (mode === playMode.random) {
        // 将一个数组打乱
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      // 获得新的播放列表
      this.setPlayList(list)
    },
    resetCurrentIndex (list) {
      // 在播放list中找到当前歌曲对应的索引
      // 找到在播放列表中当前歌曲的位置，才可以执行播放下一首的行为
      // 返回符合测试条件的第一个数组元素索引
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    getLyric () {
      // Song类的实例具有getLyric()方法
      this.currentSong.getLyric().then((lyric) => {
        if (this.currentSong.lyric !== lyric) {
          return
        }
        // 对得到的 lyric 进行解析
        // let lyric = new Lyric(lyricStr, handler) 回调函数，歌词发生改变的调用，可以获取当前歌词及所在并，并执行滚动操作。
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.playing) {
          this.currentLyric.play()
        }
      }).catch(() => {
        // 当获取不到歌词时做的一些操作
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    // 参数为歌词总的行数lineNum和当前播放歌词txt
    handleLyric ({ lineNum, txt }) {
      this.currentLineNum = lineNum
      // 大于5行，才需要滚动，为了让当前元素位于中间位置
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        // 1s的动画时间
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        // 5行之内，直接滚动到顶部
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      // 在cd页面展示当前播放的歌词
      this.playingLyric = txt
    },
    showPlaylist () {
      this.$refs.playlist.show()
    },
    middleTouchStart (e) {
      this.touch.initiated = true
      const touch = e.touches[0]
      //  pageX/pageY: 鼠标相对于整个页面的X/Y坐标
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    // 只支持横向滚动
    middleTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      // 横向和纵向移动的宽度
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      // 判断是否是纵向滚动
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      // cd页面右侧所处的位置范围 [-window.innnerWidth, 0]
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      // 左滑的宽度 [-window.innnerWidth, 0]
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      // 左滑的宽度占整个页面的比例
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      // 歌词左移的效果
      this.$refs.lyricList.$el.style[transform] = `translate(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      // cd 页面透明度变低
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd (e) {
      let offsetWidth
      let opacity
      // 页面为cd时，左滑的比例超过0.1，就切换为歌词页面
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        // 页面为歌词时， 右滑的比例超过0.1，就切换为cd页面
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 300
      // lyric最终移动到某个位置，及移动变化的时间
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      // cd最终的透明度及透明度变化的时间
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
      this.touch.initiated = false
    },
    _pad (num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    _getPosAndScale () {
      // 在Chrome里算一下两个中心的距离
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),
    ...mapActions([
      'savePlayHistory',
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  },
  watch: {
    currentSong (newSong, oldSong) {
      // 当歌曲处于暂停状态时，切换播放模式，歌曲不会播放
      if (!newSong.id === oldSong.id) {
        return
      }
      // 当前歌曲发生变化时，歌词停止播放，当用户不再切换歌曲时，延时播放歌曲并获取歌词。
      if (this.currentLyric) {
        this.currentLyric.stop()
        this.currentTime = 0
        this.playingLyric = ''
        this.currentLineNum = 0
      }
      // 添加一个延迟，dom加载后再请求歌曲的url
      // 将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。
      // 手机从后台切到前台，就可以继续播放
      // 无论currentSong变化多少次，播放和获取歌词只执行最后一次
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$refs.audio.play() // 同步
        this.getLyric() // 异步
      }, 1000)
    },
    // 监听playing的变化，实现播放或暂停
    playing (newPlaying) {
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause()
      })
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    PlayList
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;

    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }

    .top {
      position: relative;
      margin-bottom: 25px;

      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;

        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          // 逆时针旋转90度
          transform: rotate(-90deg);
        }
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }

      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }

    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      // 空白符合并，换行符失效
      white-space: nowrap;
      font-size: 0;

      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;

        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          height: 100%;

          .cd {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border: 10px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;

            &.play {
              animation: rotate 20s linear infinite;
            }

            &.pause {
              animation-play-state: paused;
            }

            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }
        }

        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;

          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }

      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;

          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;

            &.current {
              color: $color-text;
            }
          }
        }
      }
    }

    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;

      .dot-wrapper {
        text-align: center;
        font-size: 0;

        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;

          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }

      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;

        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;

          &.time-l {
            text-align: left;
          }

          &.time-r {
            text-align: right;
          }
        }

        .progress-bar-wrapper {
          flex: 1;
        }
      }

      .operators {
        display: flex;
        align-items: center;

        .icon {
          flex: 1;
          color: $color-theme;

          &.disable {
            color: $color-theme-d;
          }

          i {
            font-size: 30px;
          }
        }

        .i-left {
          text-align: right;
        }

        .i-center {
          padding: 0 20px;
          text-align: center;

          i {
            font-size: 40px;
          }
        }

        .i-right {
          text-align: left;
        }

        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }

    &.normal-enter-active, &.normal-leave-active {
      transition: all 0.4s;

      .top, .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }

    &.normal-enter, &.normal-leave-to {
      opacity: 0;

      .top {
        transform: translate3d(0, -100px, 0);
      }

      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }

  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: $color-highlight-background;

    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.4s;
    }

    &.mini-enter, &.mini-leave-to {
      opacity: 0;
    }

    .icon {
      flex: 0 0 40px;
      width: 40px;
      padding: 0 10px 0 20px;

      img {
        border-radius: 50%;

        &.play {
          animation: rotate 10s linear infinite;
        }

        &.pause {
          animation-play-state: paused;
        }
      }
    }

    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;

      .name {
        margin-bottom: 2px;
        no-wrap();
        font-size: $font-size-medium;
        color: $color-text;
      }

      .desc {
        no-wrap();
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }

    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;

      .icon-play-mini, .icon-pause-mini, .icon-playlist {
        font-size: 30px;
        color: $color-theme-d;
      }

      .icon-mini {
        font-size: 32px;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
