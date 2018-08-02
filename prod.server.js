/* *思想： 利用express起了一个服务，监听了9000端口，用了四个api路由,监听四个api接口，
  * 利用axios做http请求，去模拟refer和host，qq服务器会返回数据，然后将dist目录作为静态资源目录
  * 然后就可以启动server
*/
// 测试 dist node prod.server.js
// 利用 Express 起一个本地测试服务器

var express = require('express')
var config = require('./config/index')
var axios = require('axios')

var app = express()

// axios 结合 node.js 代理后端请求
var apiRoutes = express.Router()
// 推荐页列表数据
apiRoutes.get('/getDiscList', function (req, res) {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'

  axios.get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then(function (response) {
      res.json(response.data)
    })
    .catch(function (error) {
      console.log(error)
    })
})
// 获取歌词数据
apiRoutes.get('/lyric', function (req, res) {
  var url = 'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg'

  axios.get(url, {
      headers: {
        referer: 'https://c.y.qq.com/',
        host: 'c.y.qq.com'
      },
      params: req.query
    })
    .then((response) => {
      // jsonp 数据转为 json 数据
      var result = response.data

      if (typeof result === 'string') {
        var reg = /^\w+\(({[^()]+})\)$/
        var matches = result.match(reg)

        if (matches) {
          result = JSON.parse(matches[1])
        }
      }

      res.json(result)
      // res.json(response.data)
    })
    .catch((error) => {
      console.log(error)
    })
})

// 推荐页歌单数据
apiRoutes.get('/getcdInfo', function (req, res) {
    var url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
  
    axios.get(url, {
        headers: {
          referer: 'https://c.y.qq.com/',
          host: 'c.y.qq.com'
        },
        params: req.query
      })
      .then((response) => {
        // jsonp 数据转为 json 数据
        var result = response.data
  
        if (typeof result === 'string') {
          var reg = /^\w+\(({[^()]+})\)$/
          var matches = result.match(reg)
  
          if (matches) {
            result = JSON.parse(matches[1])
          }
        }
  
        res.json(result)
        // res.json(response.data)
      })
      .catch((error) => {
        console.log(error)
      })
  })

  // 搜索页面数据获取
apiRoutes.get('/getsearchList', function (req, res) {
    var url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
  
    axios.get(url, {
        headers: {
          referer: 'https://c.y.qq.com/',
          host: 'c.y.qq.com'
        },
        params: req.query
      })
      .then((response) => {
        // jsonp 数据转为 json 数据
        var result = response.data
  
        if (typeof result === 'string') {
          var reg = /^\w+\(({[^()]+})\)$/
          var matches = result.match(reg)
  
          if (matches) {
            result = JSON.parse(matches[1])
          }
        }
  
        res.json(result)
        // res.json(response.data)
      })
      .catch((error) => {
        console.log(error)
      })
  })


app.use('/api', apiRoutes)

// 将dist目录作为静态服务的入口
app.use(express.static('./dist'))

// 端口
var port = process.env.PORT || config.build.port

// 监听端口
module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:' + port + '\n')
})