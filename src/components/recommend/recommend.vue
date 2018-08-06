<template>
  <!-- better-scroll原理：父容器固定高度，并设置overflow：hidden，子元素超出父元素高度后将被隐藏，超出部分可滚动且没有滚动条。 -->
  <div class='recommend' ref="recommend">
    <!-- 在mounted时初始化scroll，因此需要绑定data，监听data变化，然后就会调用refresh方法。就可以实现滚动 -->
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <!-- 轮播图 -->
        <div class="wrapper">
          <!-- 使用了v-if的时候，如果值为false，那么页面将不会有这个html标签生成。
          v-show则是不管值为true还是false，html元素都会存在，只是CSS中的display显示或隐藏 -->
          <swiper :options="swiperOption" v-if='showSwiper'>
            <swiper-slide v-for="item of recommends" :key='item.id'>
              <a :href = 'item.linkUrl'>
                <!-- better-scroll 点击事件与fastclick点击事件相冲突导致图片点击无反应,
                点击的图片添加fastclick默认的class属性即可needsclick -->
                <!-- onLoad：事件是当图片加载完成之后触发  -->
                <img class="swiper-img needsclick"  @load='loadImage' :src="item.picUrl"/>
              </a>
            </swiper-slide>
            <div class="swiper-pagination"  slot="pagination"></div>
          </swiper>
        </div>
          <!-- 歌单推荐列表 -->
          <div class="recommend-list">
            <h1 class="list-title">热门歌单推荐</h1>
            <ul>
              <li @click="selectItem(item)" v-for="item in discList" :key='item.dissid' class="item">
                <div class="icon">
                  <!-- 图片懒加载，属性值时图片url -->
                  <img width="60" height="60" v-lazy="item.imgurl">
                </div>
                <div class="text">
                  <h2 class="name" v-html="item.creator.name"></h2>
                  <p class="desc" v-html="item.dissname"></p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <!-- 加载，在歌单列表为0时出现，这个部分不会滚动 -->
        <div v-show="!discList.length" class="loading-container">
          <loading></loading>
      </div>
    </scroll>
    <!-- router-view 当做是一个容器，它渲染的组件是你使用 vue-router 指定的(显示内容由router.push())，是二级路由的容器 -->
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import Loading from 'base/loading/loading'
import Scroll from 'base/scroll/scroll'
import { getRecommend, getDiscList } from 'api/recommend'
import { ERR_OK } from 'api/config'
import { playlistMixin } from 'common/js/mixin'
import { mapMutations } from 'vuex'

export default {
  mixins: [playlistMixin],
  data () {
    return {
      // 轮播图数据，每个item对象包含id linkUrl picUrl属性
      recommends: [],
      discList: [],
      swiperOption: {
        pagination: '.swiper-pagination',
        loop: true,
        paginationType: 'bullets',
        observeParents: true,
        observer: true
      }
    }
  },
  // vue实例在被创建完成后被立即调用
  created () {
    this._getRecommend()
    this._getDiscList()
  },

  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      // 刷新 scroll
      this.$refs.scroll.refresh()
    },
    // 点击事件，传入了item
    selectItem (item) {
      // 点击 <router-link :to="..."> 等同于调用 router.push(...)。
      // 此处完成了路由跳转功能
      this.$router.push({
        // 只写了path，没有写组件
        path: `/recommend/${item.dissid}`
      })
      // 调用mutations中的方法，将数据写入state中的disc
      this.setDisc(item)
    },
    loadImage () {
      // 确保只执行一次，而不是每张轮播图加载都执行
      // 确保swiper的高度被撑开后，再初始化scroll
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true
      }
    },
    // 获取轮播图
    _getRecommend () {
      // getRecommend()返回的是promise
      // then的参数是完成处理啊函数
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider
        }
      })
    },
    // 获取歌单列表
    _getDiscList () {
      getDiscList().then((res) => {
        if (res.code === ERR_OK) {
          this.discList = res.data.list
        }
      })
    },
    // 扩展运算符
    ...mapMutations({
      setDisc: 'SET_DISC'
    })
  },
  computed: {
    // 轮播图显示的条件
    showSwiper () {
      return this.recommends.length
    }
  },
  components: {
    Loading,
    Scroll
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
@import '~common/stylus/variable';
.wrapper >>> .swiper-pagination-bullet-active {
  background: #fff !important;
}

.recommend {
  // 父容器固定高度
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .recommend-content {
    // 子元素超出父元素高度就隐藏
    height: 100%;
    overflow: hidden;

    .wrapper {
      // position: relative;
      width: 100%;
      overflow: hidden;
      height: 0;
      // 高度相对于宽度自动撑开40%, 解决图片未加载时，文字上移的情况
      padding-bottom: 40%;

      .swiper-img {
        width: 100%;
      }
    }

    .recommend-list {
      .list-title {
        height: 65px;
        line-height: 65px;
        text-align: center;
        font-size: $font-size-medium; // 14px
        color: $color-theme; // 黄色
      }

      .item {
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 0 20px 20px 20px;

        .icon {
          flex: 0 0 60px;
          width: 60px;
          padding-right: 20px;
        }

        .text {
          display: flex;
          flex-direction: column; // 在垂直方向上弹性布局
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;  // 14px

          .name {
            margin-bottom: 10px;
            color: $color-text; // 白色
          }

          .desc {
            color: $color-text-d; // 灰色
          }
        }
      }
    }

    .loading-container {
      position: absolute;
      width: 100%;
      // 实现垂直居中的效果
      top: 50%;
      transform: translateY(-50%); // 向上移动自身高度的50%
    }
  }
}
</style>
