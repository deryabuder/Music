<template>
  <div class="tab">
    <router-link tag="div" class="tab-item" to="/recommend">
      <span class="tab-link">推荐</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/singer">
      <span class="tab-link">歌手</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/rank">
      <span class="tab-link">排行
      </span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/search">
      <span class="tab-link">搜索</span>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'Tab'
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.tab {
  // 弹性布局，水平居中，
  display: flex;
  height: 44px;
  line-height: 44px;
  font-size: $font-size-medium; // 14px

  .tab-item {
    flex: 1;
    text-align: center;

    .tab-link {
      padding-bottom: 5px; // border-box垂直居中
      color: $color-text-l; // 浅灰色
    }
    // &父级元素
    // router-link 标签在选中的时候，会自动给整个标签添加一个 router-link-active的class
    &.router-link-active {
      .tab-link {
        color: $color-theme; // 黄色
        border-bottom: 2px solid $color-theme;
      }
    }
  }
}
</style>
