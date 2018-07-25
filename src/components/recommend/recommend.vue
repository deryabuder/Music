<template>
  <div class='recommend' ref="recommend">
    <!-- 在mounted时初始化scroll，因此需要绑定data，监听data变化，然后就会调用refresh方法。就可以实现滚动 -->
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div class="wrapper">
          <swiper :options="swiperOption" v-if='showSwiper'>
            <swiper-slide v-for="item of recommends" :key='item.id'>
              <a :href = 'item.linkUrl'>
                <!-- better-scroll 点击事件与fastclick点击事件相冲突导致图片点击无反应,
                点击的图片添加fastclick默认的class属性即可needsclick -->
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
              <li @click="selectItem(item)" v-for="item in discList" class="item" :key='item.dissid'>
                <div class="icon">
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
        <div v-show="!discList.length" class="loading-container">
          <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import Loading from 'base/loading/loading'
import Scroll from 'base/scroll/scroll'
import { getRecommend, getDiscList } from 'api/recommend'
import { ERR_OK } from 'api/config'

export default {
  data () {
    return {
      recommends: [],
      discList: [],
      swiperOption: {
        pagination: '.swiper-pagination',
        loop: true,
        paginationType: 'fraction',
        observeParents: true,
        observer: true
      }
    }
  },
  created () {
    this._getRecommend()
    this._getDiscList()
  },

  methods: {
    // 获取轮播图
    _getRecommend () {
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
    loadImage () {
      // 确保只执行一次，而不是每张轮播图加载都执行
      // 确保swiper的高度被撑开后，再初始化scroll
      if (!this.checkLoaded) {
        this.$refs.scroll.refresh()
        this.checkLoaded = true
      }
    }
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

.recommend {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;

  .recommend-content {
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
        font-size: $font-size-medium;
        color: $color-theme;
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
          flex-direction: column;
          justify-content: center;
          flex: 1;
          line-height: 20px;
          overflow: hidden;
          font-size: $font-size-medium;

          .name {
            margin-bottom: 10px;
            color: $color-text;
          }

          .desc {
            color: $color-text-d;
          }
        }
      }
    }

    .loading-container {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
