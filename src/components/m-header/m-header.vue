<template>
  <div class='m-header'>
    <h1 class='text'>Music</h1>
    <!-- <router-link> 组件支持用户在具有路由功能的应用中 (点击) 导航。
      通过 to 属性指定目标地址，默认渲染成带有正确链接的 <a> 标签，可以通过配置 tag 属性生成别的标签。 -->
    <router-link tag='div' class='mine' to='/user'>
      <i class='icon-mine'></i>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'MHeader'
}
</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
// css中引入其它的css，前面需要加~。@代表src目录
@import '~common/stylus/variable';
@import '~common/stylus/mixin';

.m-header {
  position: relative;
  height: 44px;
  text-align: center;
  color: $color-theme;

  .text {
    display: inline-block;
    vertical-align: top; // 把元素的顶端与行中最高元素的顶端对齐
    line-height: 44px;
    font-size: $font-size-large; // 18px
  }

  .mine {
    position: absolute;
    top: 0;
    right: 0; //靠右显示

    .icon-mine {
      display: block;
      padding: 12px; // 保证了垂直居中
      font-size: 20px;
      color: $color-theme;
    }
  }
}
</style>
