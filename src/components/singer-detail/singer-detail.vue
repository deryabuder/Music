<template>
  <transition name='slider'>
    <div class='singer-detail'></div>
  </transition>
</template>

<script type='text/ecmascript-6'>

</script>

<style scoped lang='stylus' rel='stylesheet/stylus'>
@import '~common/stylus/variable';

.singer-detail {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $color-background;
}

// 从右向左划入的动画
.slider-enter-active, .slider-leave-active {
  transition: all 0.3s;
}

.slider-enter, .slider-leave-to {
  transform: translate3d(100%, 0, 0);
}
</style>
