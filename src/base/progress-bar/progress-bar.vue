<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <!-- 播放进度 -->
      <div class="progress" ref="progress"></div>
      <!-- 当前的位置 -->
       <!-- 阻止浏览器的默认行为 -->
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { prefixStyle } from 'common/js/dom'

const progressBtnWidth = 16
const transform = prefixStyle('transform')

export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  created () {
    // 共享数据
    this.touch = {}
  },
  methods: {
    progressTouchStart (e) {
      this.touch.initiated = true
      this.touch.startX = e.touches[0].pageX
      // 开始的偏移量
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      // 手指移动的偏移量
      const deltaX = e.touches[0].pageX - this.touch.startX
      // btn覆盖的部分不算播放进度
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
      // 计算手指移动后的总的偏移量
      this._offset(offsetWidth)
    },
    progressTouchEnd () {
      this.touch.initiated = false
      this._triggrPercent()
    },
    // 点击进度条改变进度条和按钮的位置
    progressClick (e) {
      // 返回元素的大小及其相对于视口的位置
      const rect = this.$refs.progressBar.getBoundingClientRect()
      // pageX 是元素距离视口左侧的距离
      const offsetWidth = e.pageX - rect.left
      this._offset(offsetWidth)
      // 当我们点击 progressBtn时， e.offsetX获取错误
      // this._offset(e.offsetX)
      // 通知播放器
      this._triggrPercent()
    },
    _triggrPercent () {
      // 计算拖动之后 percent发送给父组件player
      // 进度条的总长度
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const percent = this.$refs.progress.clientWidth / barWidth
      // 基础组件，只派发事件，不管逻辑
      this.$emit('percentChange', percent)
    },
    // 改变滚动条的进度和按钮的位置
    _offset (offsetWidth) {
      // 已播放的宽度变大（颜色改变）
      this.$refs.progress.style.width = `${offsetWidth}px`
      // 按钮位置改变
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
    }
  },
  watch: {
    // 播放的时候改变进度条宽度和按钮的位置
    percent (newPercent) {
      // 在没有拖动进度条时，进度条才会计算播放的位置
      if (newPercent >= 0 && !this.touch.initiated) {
        // 减去的是Bth初始占用的宽度
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        const offsetWidth = newPercent * barWidth
        this._offset(offsetWidth)
      }
    }
  }
}
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.progress-bar {
  height: 30px;

  .bar-inner {
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);

    .progress {
      position: absolute;
      height: 100%;
      background: $color-theme;
    }

    .progress-btn-wrapper {
      position: absolute;
      left: -8px; // 考虑进度条4px的高度
      top: -13px;
      width: 30px;
      height: 30px;

      .progress-btn {
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid $color-text;
        border-radius: 50%;
        background: $color-theme;
      }
    }
  }
}
</style>
