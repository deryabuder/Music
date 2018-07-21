<template>
  <div class='recommend'>
    <div class='recommend-content'>
      <div class="wrapper">
        <swiper :options="swiperOption" v-if='showSwip'>
          <swiper-slide v-for="item of recommends" :key='item.id'>
            <a :href = 'item.linkUrl'>
              <img class="swiper-img" :src="item.picUrl"/>
            </a>
          </swiper-slide>
          <div class="swiper-pagination"  slot="pagination"></div>
        </swiper>
      </div>
      <div class='recommend-list'>
        <h1 class='list-title'>热门歌单推荐</h1>
        <ul>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { getRecommend } from 'api/recommend'
import { ERR_OK } from 'api/config'

export default {
  name: 'Recommend',
  data () {
    return {
      recommends: [],
      swiperOption: {
        pagination: '.swiper-pagination',
        loop: true,
        autoplay: true,
        paginationType: 'bullets',
        // 当Swiper的父元素或Swiper变化时，Swiper更新。解决轮播图宽度计算错误的问题
        observer: true,
        observeParents: true
      }
    }
  },
  created () {
    this._getRecommend()
  },
  methods: {
    _getRecommend () {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider
        }
      })
    }
  },
  computed: {
    showSwip () {
      return this.recommends.length
    }
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
    }
  }
}
</style>
