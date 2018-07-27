<template>
  <div class='player' v-show='playlist.length > 0'>
    <!-- v-if 是动态地向DOM树内添加或者删除DOM元素; v-show 是通过设置DOM元素的display样式属性控制显隐 -->
    <!-- v-if有更高的切换消耗，v-show有更高的初始渲染消耗 -->
    <!-- 正常的播放器 -->
    <transition name='normal'
                @enter='enter'
                @after-enter='afterEnter'
                @leave='leave'
                @after-leave='afterLeave'>
      <div class='normal-player' v-show='fullScreen'>
         <!-- 背景图 -->
        <div class='background'>
          <img width='100%' height='100%' :src='currentSong.image'>
        </div>
        <!-- 顶部 -->
        <div class='top'>
          <!-- 返回按钮 -->
          <div class='back' @click='back'>
            <i class='icon-back'></i>
          </div>
          <h1 class='title' v-html="currentSong.name"></h1>
          <h2 class='subtitle' v-html='currentSong.singer'></h2>
        </div>
         <!-- 中部 -->
        <div class='middle'>
          <!-- 唱片 -->
          <div class='middle-l'>
            <div class='cd-wrapper' ref='cdWrapper'>
              <div class='cd' :class="cdCls">
                <image class='image' :src='currentSong.image'/>
              </div>
            </div>
          </div>
          <scroll class='middle-r' ref='lyricList' :data='currentLyric.lines &&currentLyric.lines'>
            <div class='lyric-wrapper'>
              <div v-if='currentLyric'>
                <p ref='lyricLine'
                   class='text'
                   :class="{'current': currenLineNum === index}"
                   v-for='(line, index) of currentLyric.lines' :key='index'>{{line.txt}}
                </p>
              </div>
            </div>
          </scroll>
        </div>
        <!-- 底部操作区 -->
        <div class='bottom'>
          <!-- 播放进度 -->
          <div class='progress-wrapper'>
            <span class='time time-l'>{{format(currentTime)}}</span>
             <!-- 进度条组件 -->
            <div class='progress-bar-wrapper'>
              <progress-bar :percent = 'percent'
                            :percentChane='onProgressBarChange'></progress-bar>
            </div>
            <span class='time time-r'>{{format(currentSong.duration)}}</span>
          </div>
           <!-- 底部操作区 -->
          <div class='oprators'>
            <div class='icon i-left' @click='changeMode'>
              <i :class='iconMode'></i>
            </div>
            <div class='icon i-left' :class='disableCls'>
              <i @click='prev' class='icon-prev'></i>
            </div>
            <div class='icon i-center' :class='disableCls'>
              <i @click='togglePlaying' :class='playIcon'></i>
            </div>
            <div class='icon i-right' :class='disableCls'>
              <i @click='next' class='icon-next'></i>
            </div>
            <div class='icon i-right'>
              <i class='icon icon-not-favorite'></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!-- 最小化的播放器 -->
    <transition name='mini'>
      <div class='mini-player' @click='open'>
        <div class='icon'>
          <img width='40' height='40' :class='cdCls'>
        </div>
        <div class='text'>
          <h2 class='name'></h2>
          <p class='desc'></p>
        </div>
        <div class='control'>
          <progress-circle :radius='radius' :percent='percent'>
          <!-- 里面的dom会被作为子组件的slot -->
          <!-- 阻止冒泡 -->
          <i class="miniIcon"
             @click.stop='togglePlaying'></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class='icon-playlist'></i>
        </div>
      </div>
    </transition>
    <!-- 播放器 -->
    <audio ref='audio'
           :src='currentSong.url'
           @canplay="ready"
           @error='error'
           @timeupdate='updateTime'
           @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
// 从vuex取数据到组件中
import { mapGetters, mapMutations } from 'vuex'
import animations from 'create-keyframe-animation'
import { prefixStyle } from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import { playMode } from 'common/js/config'
import { shuffle } from 'common/js/util'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'

const transform = prefixStyle('transform')
export default {
  data () {
    return {
      // 标志位，保证了不会发生快速点击时dom没有成功渲染的问题
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currenLineNum: 0
    }
  },
  computed: {
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    // 改变图标的样式
    iconMode () {
      // 比较的是数字
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
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
      'sequenceList'
    ])
  },
  methods: {
    back () {
      this.setFullScreen(false)
    },
    open () {
      this.setFullScreen(true)
    },
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
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })

      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter () {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave (el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      // 解构赋值
      const { x, y, scale } = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave () {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    togglePlaying () {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
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
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
    },
    next () {
      if (!this.songReady) {
        return
      }
      let index = this.currentIndex + 1
      if (index === this.playlist.length) {
        index = 0
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    prev () {
      if (!this.songReady) {
        return
      }
      let index = this.currentIndex - 1
      if (index === -1) {
        index = this.playlist.length
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    ready () {
      this.songReady = true
    },
    error () {
      // 歌曲加载失败时
      this.songReady = true
    },
    updateTime (e) {
      this.currentTime = e.target.currentTime
    },
    format (interval) {
      // 向下取整
      interval = interval | 0
      const minute = interval / 60 | 0
      const second = this._pad(interval % 60)
      return `${minute}:${second}`
    },
    onProgressBarChange (percent) {
      this.$refs.audio.currentTime = this.currentSong.duration * percent
      if (!this.playing) {
        this.togglePlaying()
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
        // 对得到的 lyric 进行解析
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.playing) {
          this.currentLyric.play()
        }
      })
    },
    handleLyric ({ lineNum, txt }) {
      this.currenLineNum = lineNum
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
      const y = window.innerHeight - -paddingTop - width / 2 - paddingBottom
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
    })
  },
  watch: {
    currentSong (newSong, oldSong) {
      // 当歌曲处于暂停状态时，切换播放模式，歌曲不会播放
      if (!newSong.id === oldSong.id) {
        return
      }
      // 添加一个延迟，dom加载后再请求歌曲的url
      // 将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。
      this.$nextTick(() => {
        this.$refs.audio.play()
        this.getLyric()
      })
    }
  },
  playing (newPlaying) {
    const audio = this.$refs.audio
    this.$nextTick(() => {
      newPlaying ? audio.play() : audio.pause()
    })
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll
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
          transform: rotate(-90deg);
        }
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        @include no-wrap();        font-size: $font-size-large;
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
              -webkit-animation-play-state: paused;
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
            margin-right: 5px;
          }

          &.time-r {
            text-align: right;
            margin-left: 5px;
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
        @include no-wrap();        font-size: $font-size-medium;
        color: $color-text;
      }

      .desc {
        @include no-wrap();        font-size: $font-size-small;
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