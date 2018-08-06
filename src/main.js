// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store' // vuex状态管理
// 移动设备上的浏览器默认会在用户点击屏幕大约延迟300毫秒后才会触发点击事件，
// 这是为了检查用户是否在做双击。为了能够立即响应用户的点击事件，才有了FastClick。
import fastclick from 'fastclick'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import VueLazyload from 'vue-lazyload'
import 'common/stylus/index.styl'
// require styles
import 'swiper/dist/css/swiper.css'

// 移动端调试工具，在移动端输出日志
/* eslint-disable no-unused-vars */
// import vConsole from 'vconsole'
// console.log('Hello world')

fastclick.attach(document.body)
Vue.use(VueAwesomeSwiper)
Vue.use(VueLazyload, {
  loading: require('common/image/default1.png'),
  loading2: require('common/image/default2.png')
})

Vue.config.productionTip = false

// 根组件
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  // render函数是渲染一个视图，然后提供给el挂载，如果没有render那页面什么都不会出来
  render: h => h(App)
  // 为下面的简写形式
  // render: function (createElement) {
  // return createElement(App);}
})
