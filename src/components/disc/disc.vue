<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list'
// recommend组件将disc数据写入state，当前组件中state中获取数据
import { getSongList } from 'api/recommend'
import { ERR_OK } from 'api/config'
import { mapGetters } from 'vuex'
import { createSong } from 'common/js/song'

export default {
  data () {
    return {
      // 抓取的数据，没有用到 vuex
      songs: []
    }
  },
  computed: {
    title () {
      return this.disc.dissname
    },
    bgImage () {
      return this.disc.imgurl
    },
    // 父组件写入数据，子组件从state中获取数据
    ...mapGetters([
      'disc'
    ])
  },
  created () {
    this._getSongList()
  },
  methods: {
    _getSongList () {
      // 歌单详情页面刷新时，会返回主页面
      if (!this.disc.dissid) {
        this.$router.push('/recommend')
        return
      }
      // jsonp请求返回的是一个promise
      getSongList(this.disc.dissid).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.cdlist[0].songlist)
        }
      })
    },
    // 和singer-detail里的代码一致
    _normalizeSongs (list) {
      let ret = []
      list.forEach((musicData) => {
        // 只有歌曲包含这两项信息，才会成为指定格式的对象存放在this.songs中
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  },
  components: {
    MusicList
  }
}

</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s;
}

.slide-enter, .slide-leave-to {
  // 从右侧划出，然后回归右侧
  transform: translate3d(100%, 0, 0);
}
</style>
