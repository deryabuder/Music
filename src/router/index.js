import Vue from 'vue'
import Router from 'vue-router'

// 路由懒加载， 由同步加载变为异步加载
// 减少build中app.js的大小
const Recommend = (resolve) => {
  import('components/recommend/recommend').then((module) => {
    // then的参数是完成处理函数
    resolve(module)
  })
}
const Rank = (resolve) => {
  import('components/rank/rank').then((module) => {
    resolve(module)
  })
}
const Search = (resolve) => {
  import('components/search/search').then((module) => {
    resolve(module)
  })
}
const Singer = (resolve) => {
  import('components/singer/singer').then((module) => {
    resolve(module)
  })
}
const SingerDetail = (resolve) => {
  import('components/singer-detail/singer-detail').then((module) => {
    resolve(module)
  })
}
const Disc = (resolve) => {
  import('components/disc/disc').then((module) => {
    resolve(module)
  })
}
const TopList = (resolve) => {
  import('components/top-list/top-list').then((module) => {
    resolve(module)
  })
}
const UserCenter = (resolve) => {
  import('components/user-center/user-center').then((module) => {
    resolve(module)
  })
}

Vue.use(Router)

export default new Router({
  routes: [{
    // 重定向
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    component: Recommend,
    children: [{
      path: ':id',
      component: Disc
    }]
  },
  {
    path: '/singer',
    component: Singer,
    children: [{
      // :id表示以id为变量
      path: ':id',
      component: SingerDetail
    }]
  },
  {
    path: '/rank',
    component: Rank,
    children: [{
      path: ':id',
      component: TopList
    }]
  },
  {
    path: '/search',
    component: Search,
    children: [{
      path: ':id',
      component: SingerDetail
    }]
  },
  {
    path: '/user',
    component: UserCenter
  }
  ]
})
