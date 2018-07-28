import {
  getLyric
} from 'api/song'
import {
  ERR_OK
} from 'api/config'
import {
  Base64
} from 'js-base64'

export default class Song {
  constructor ({
    id, // 歌曲id
    mid, // 歌曲mid
    singer, // 歌曲对应的歌手
    name, // 歌曲名称
    album, // 专辑名称
    duration, // 歌曲时长
    image, // 歌曲图片
    url // 歌曲请求路径
  }) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }
  getLyric () {
    if (this.lyric) {
      // 返回一个已决的promise
      return Promise.resolve(this.lyric)
    }
    // 返回一个未决的promise
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.retcode === ERR_OK) {
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        }
        // else {
        //   reject('no lyric')
        // }
      })
    })
  }
}

export function createSong (musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSinger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=0&guid=126548448`
  })
}

function filterSinger (singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}
