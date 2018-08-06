<template>
  <div class='singer' ref='singer'>
    <!-- 从子组件接收的select事件 -->
    <list-view @select="selectSinger" :data='singers' ref='list'></list-view>
    <!-- router-view 当做是一个容器，它渲染的组件是你使用 vue-router 指定的 -->
    <router-view></router-view>
  </div>
</template>

// singer.vue是listview.vue的父组件
<script type='text/ecmascript-6'>
import { getSingerList } from 'api/singer'
import { ERR_OK } from 'api/config'
import Singer from 'common/js/singer'
import ListView from 'base/listview/listview'
import { mapMutations } from 'vuex'
import { playlistMixin } from 'common/js/mixin'

const HOT_NAME = '热门'
// 将热门歌手数据限制在10条
const HOT_SINGER_LEN = 10
export default {
  mixins: [playlistMixin],
  data () {
    return {
      singers: []
    }
  },
  created () {
    this._getSingerList()
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.singer.style.bottom = bottom
      // 手动刷新scroll
      this.$refs.list.refresh()
    },
    selectSinger (singer) {
      // 进行路由跳转，相当于 <router-link :to="..."> 一个是声明式，一个是编程式
      this.$router.push({
        path: `/singer/${singer.id}`
      })
      // 子组件中点击，然后将事件传递给父组件，父组件完成跳转，并将歌手信息写入state，从而完成与二级路由歌手详情页的数据共享。
      this.setSinger(singer)
    },
    _getSingerList () {
      getSingerList().then((res) => {
        if (res.code === ERR_OK) {
          this.singers = res.data.list
          this.singers = this._normalizeSinger(this.singers)
        }
      })
    },
    _normalizeSinger (list) {
      // 热门歌手数据
      let map = {
        // 属性值是hot
        hot: {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((item, index) => {
        // map.hot.item.items中存储了热门歌手数据
        if (index < HOT_SINGER_LEN) {
          map.hot.items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        }
        //
        const key = item.Findex
        // 判断 map 是否存在key属性，不存在的话，创建key属性及对应的对象
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          }
        }
        // 将歌手数据按 Findex的不同放入不同 key值的对象中
        map[key].items.push(new Singer({
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        }))
      })
      // 对象的遍历是无序的，为了得到有序列表， 需要处理map
      let hot = []
      let ret = []
      for (let key in map) {
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val)
        }
      }
      // ret的每个元素都是对象，包含title和 items 属性
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      // 得到一个顺序排序的一维数组，数组中每个元素都是对象，包含title和 items 属性
      return hot.concat(ret)
    },
    // 为写数据提供语法糖，调用
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  },
  components: {
    ListView
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus'>
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>
