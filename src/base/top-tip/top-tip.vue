<!-- 顶部提示 组件 -->
<template>
  <transition name='drop'>
    <div class='top-tip' v-show='showFlag' @click.stop='hide'>
      <slot></slot>
    </div>
  </transition>
</template>

<script type='text/ecmascript-6'>

export default {
  props: {
    delay: {
      type: Number,
      default: 2000
    }
  },
  data () {
    return {
      showFlag: false
    }
  },
  methods: {
    show () {
      this.showFlag = true
      // 防抖，在函数执行之前，我们先清除定时器，知道我们操作结束(添加歌曲完成)之后，函数才会继续执行
      clearTimeout(this.timer)
      // 定时取消添加歌曲成功的提醒
      this.timer = setTimeout(() => {
        this.hide()
      }, this.delay)
    },
    // 点击取消添加歌曲成功的提醒
    hide () {
      this.showFlag = false
    }
  }
}

</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
@import '~common/stylus/variable';

.top-tip {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 500;
  background: $color-dialog-background;

  &.drop-enter-active, &.drop-laeve-active {
    transition: all 0.3s;
  }

  &.drop-enter, &.drop-leave-to {
    // y轴方向上向上移动
    transform: translate3d(0, -100%, 0);
  }
}
</style>
