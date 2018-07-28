<template>
<scroll class='listview' :data='data' ref='listview' :listenScroll='listenScroll' @scroll='scroll' :probeType='probeTybe'>
  <ul>
    <li v-for='group in data' class="list-group" :key='group.title' ref='listGroup'>
      <h2 class='list-group-title'>{{group.title}}</h2>
      <ul>
        <li @click='selectItem(item)' v-for='item in group.items' class='list-group-item' :key='item.id'>
          <img v-lazy='item.avatar' class='avatar'/>
          <span class='name'>{{item.name}}</span>
        </li>
      </ul>
    </li>
  </ul>
  <div class='list-shortcut' @touchstart='onShortcutTouchStart' @touchmove.stop='onShortcutTouchMove' >
    <ul>
      <li v-for='(item, index) in shortCutList'
      class='item'
      :key='item'
      :class="{'current': currentIndex === index}"
      :data-index='index'>{{item}}</li>
    </ul>
  </div>
  <div class='list-fixed' v-show='fixedTitle' ref='fixed'>
    <h1 class='fixed-title'>{{fixedTitle}}</h1>
  </div>
  <div v-show='!data.length' class='loading-container'>
    <loading></loading>
  </div>
</scroll>
</template>

<script type='text/ecmascript-6'>
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import { getData } from 'common/js/dom'

// 右侧导航每个值的高度
const ANCHOR_HEIGHT = 18
// 左侧title的高度
const TITLE_HEIGHT = 30

export default {
  created () {
    // 无需关注 touch的变化
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
    this.probeTybe = 3
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      scrollY: -1,
      currentIndex: 0,
      diff: -1
    }
  },
  computed: {
    // 右侧的快速列表
    shortCutList () {
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle () {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    // 将点击事件和所点击的元素派发给父元素 singer.vue
    selectItem (item) {
      this.$emit('select', item)
    },
    onShortcutTouchStart (e) {
      // 获取点击元素的index值
      let anchorIndex = getData(e.target, 'index')
      // 手指/鼠标接触的位置
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    onShortcutTouchMove (e) {
      // touches：表示当前跟踪的触摸操作的 Touch 对象的数组。
      let firstTouch = e.touches[0]
      // 页面坐标通过事件对象的 pageX 和 pageY 属性
      this.touch.y2 = firstTouch.pageY
      // delta偏移的锚点， | 0 向下取整
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },
    refresh () {
      this.$refs.listview.refresh()
    },
    scroll (pos) {
      // 实时获取better-scroll滚动的y轴的距离
      this.scrollY = pos.y
    },
    _scrollTo (index) {
      /**
      *  vm.$refs 一个对象，持有已注册过 ref 的所有子组件（或HTML元素）
      *  在 HTML元素 中，添加ref属性，然后在JS中通过vm.$refs.属性来获取
      *  如果获取的是一个子组件，那么通过ref就能获取到子组件中的data和methods
      */
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index])
    },
    // 计算每个位置的高度范围
    _calculateHeight () {
      // 获取每个group对应的height
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      // listHeight会比index的长度多1
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  watch: {
    data () {
      // 确保dom渲染
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    // scroll的纵向滚动位置范围 0 - maxScrollY,  maxScrollY 是负值
    // 根据子组件传来的scrollY值判断在哪个位置
    scrollY (newY) {
      const listHeight = this.listHeight
      // 当滚动到顶部， newY>0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 在中间部分滚动(不考虑上下两种情况， 无法拖出上下的空白区域)
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          // 相加，即可得到下一个title到固定的 title之间的距离
          this.diff = height2 + newY
          return
        }
      }
      // 当滚动到底部， 且-newY大于最后一个元素的上限
      // listHeight
      this.currentIndex = listHeight.length - 2
    },
    // 监听diff的变化
    diff (newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      // 减少dom操作
      if (this.fixedTop === fixedTop) {
        return
      }
      // 得到一个小于等于0的fixedTop，然后向上做平移变换
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
    }
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
@import '~common/stylus/variable';

.listview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $color-background;

  .list-group {
    padding-bottom: 30px;

    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }

    .list-group-item {
      display: flex;
      align-items: center;
      padding: 20px 0 0 30px;

      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }

      .name {
        margin-left: 20px;
        color: $color-text-l;
        font-size: $font-size-medium;
      }
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: Helvetica;

    .item {
      padding: 3px;
      line-height: 1;
      color: $color-text-l;
      font-size: $font-size-small;

      &.current {
        color: $color-theme;
      }
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;

    .fixed-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
