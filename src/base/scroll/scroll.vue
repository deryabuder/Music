<!--滚动组件-->
<template>
<!--better-scroll作用在外层wrapper容器上，只处理wrapper的第一个子元素的滚动-->
<!--在初始化scroll或refresh scroll时，会计算可滚动的高度，因此在这之前，需要确保dom已经渲染了-->
<!--给元素或子组件注册引用信息，引用信息注册在父组件的$refs对象上，引用指向dom元素或组件实例-->
  <div ref="wrapper">
    <!--slot将html从父组件传入子组件-->
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'

export default {
  // props可以将数据从listview父组件传入scroll子组件，
  props: {
    // (probeType) 1: 非实时派发scroll事件
    probeType: {
      type: Number,
      default: 1
    },
    // (click) click 事件
    click: {
      type: Boolean,
      default: true
    },
    // 是否监听滚动位置
    listenScroll: {
      type: Boolean,
      default: false
    },
    // 接收的数据
    data: {
      type: Array,
      default: null
    },
    // (pullUpLoad)是否开启上拉刷新
    pullup: {
      type: Boolean,
      default: false
    },
    // (beforeScrollStart)滚动前是否触发事件，如：滚动前让输入框失去焦点，避免滚动搜索结果时移动端键盘遮挡
    beforeScroll: {
      type: Boolean,
      default: false
    },
    // 延迟刷新
    refreshDelay: {
      type: Number,
      default: 20
    }
  },
  // 调用时间
  mounted () {
    // 异步，确保dom已经渲染
    setTimeout(() => {
      this._initScroll()
    }, 20)
  },
  methods: {
    // 初始化的方法
    _initScroll () {
      // 该组件上是否存在引用信息，引用是wrapper的dom元素
      if (!this.$refs.wrapper) {
        return
      }
      // 实例化一个滚动器 let scroll = new BScroll('.wrapper')
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        click: this.click
      })
      // 派发监听滚动位置事件
      if (this.listenScroll) {
        // this默认指向scroll， 因此需在外层保留vue实例的this
        let me = this
        this.scroll.on('scroll', (pos) => {
          // 向父组件listview传值
          me.$emit('scroll', pos)
        })
      }

      // 派发上拉刷新时间
      if (this.pullup) {
        this.scroll.on('scrollEnd', () => {
          // y属性是scroll纵轴坐标 maxScrollY是scroll最大纵向滚动位置
          if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {
            // 滑动到底部
            this.$emit('scrollToEnd')
          }
        })
      }
      // 滚动前是否触发事件
      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    },
    // 代理方法
    // 禁用 better-scroll
    disable () {
      this.scroll && this.scroll.disable()
    },
    // 启用 better-scroll, 默认 开启
    enable () {
      this.scroll && this.scroll.enable()
    },
    // 重新计算 better-scroll的高度
    refresh () {
      this.scroll && this.scroll.refresh()
    },
    // 滚动到指定的位置
    scrollTo () {
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },
    // 滚动到指定的目标元素
    scrollToElement () {
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    }
  },
  watch: {
    // 监听data变化，变化的话，延迟一段时间后刷新
    data () {
      setTimeout(() => {
        this.refresh()
      }, this.refreshDelay)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
</style>
