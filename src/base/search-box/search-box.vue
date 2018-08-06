<!-- 搜索框组件 -->
<template>
  <div class="search-box">
    <!-- 搜索图标 -->
    <i class='icon-search'></i>
    <input class='box' ref='query' v-model='query' :placeholder="placeholder"/>
    <!--删除图标,只有在搜索框输入文字时才会显示-->
    <i class='icon-dismiss' @click='clear' v-show='query'></i>
  </div>
</template>

<script type="text/ecmascript-6">
import { debounce } from 'common/js/util'

export default {
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  data () {
    return {
      query: ''
    }
  },
  methods: {
    clear () {
      this.query = ''
    },
    // 给父亲用，通过父组件来设置query的值
    setQuery (query) {
      this.query = query
    },
    // 给父亲用的，让输入框失去焦点，避免滚动搜索结果时移动端键盘遮挡
    blur () {
      this.$refs.query.blur()
    }
  },
  created () {
    // 监听query的变化，并延时发送事件给父组件（节流）
    this.$watch('query', debounce((newQuery) => {
      this.$emit('query', newQuery)
    }, 200))
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';
@import '~common/stylus/variable';

.search-box {
  display: flex;
  // 垂直居中水平对齐弹性盒的各项
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  // 让元素与它包裹的内容有一定的距离
  padding: 0 6px;
  height: 40px;
  background: $color-highlight-background;

  .icon-search {
    font-size: 24px;
    color: $color-background;
  }

  .box {
    flex: 1;
    // 元素与元素之间
    margin: 0 5px;
    line-height: 18px;
    background: $color-highlight-background;
    color: $color-text;
    font-size: $font-size-medium;

    &::placeholder {
      color: $color-text-d;
    }
  }

  .icon-dismiss {
    font-size: 16px;
    color: $color-background;
  }
}
</style>
