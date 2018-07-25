<template>
  <div class='singer' ref='singer'>
    <list-view @select="selectSinger" :data='singers'></list-view>
    <router-view></router-view>
  </div>
</template>

// singer.vue是listview.vue的父组件
<script type='text/ecmascript-6'>
import { getSingerList } from 'api/singer'
import { ERR_OK } from 'api/config'
import Singer from 'common/js/singer'
import ListView from 'base/listview/listview'
const HOT_NAME = '热门'
// 将热门歌手数据限制在10条
const HOT_SINGER_LEN = 10
export default {
  data () {
    return {
      singers: []
    }
  },
  created () {
    this._getSingerList()
  },
  methods: {
    selectSinger (singer) {
      this.$router.push({
        path: `/singer/${singer.id}`
      })
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
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      // 得到一个顺序排序的一维数组，数组中每个元素都是对象
      return hot.concat(ret)
    }
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
