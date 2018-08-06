<template>
  <div class="progress-circle">
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <!-- 透明填充 -->
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent"/>
      <!-- stroke-dasharray指定虚线中实线和空白的长度 dashOffset定义虚线开始的位置 -->
      <!-- 先将实线设置为圆的总周长，再通过设置虚线的偏移位置，实现播放进度的效果 -->
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent" :stroke-dasharray="dashArray"
              :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    radius: {
      type: Number,
      default: 100
    },
    percent: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      // 半径为 50
      dashArray: Math.PI * 100
    }
  },
  computed: {
    // 未播放的进度
    dashOffset () {
      return (1 - this.percent) * this.dashArray
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.progress-circle {
  position: relative;

  circle {
    // 当前对象的轮廓宽度
    stroke-width: 8px;
    // 设置旋转元素的基点位置
    transform-origin: center;

    &.progress-background {
      transform: scale(0.9);
      stroke: $color-theme-d; //轮廓颜色 深黄
    }

    &.progress-bar {
      // 不旋转的话，初始进度在左侧
      transform: scale(0.9) rotate(-90deg);
      stroke: $color-theme; // 黄色
    }
  }
}
</style>
