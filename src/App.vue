<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <!-- Vue的内置组件,能在组件切换过程中将状态保留在内存中,防止重复渲染DOM。  -->
    <keep-alive>
      <router-view>
      </router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'
import Player from 'components/player/player'

export default {
  name: 'App',
  components: {
    MHeader,
    Tab,
    Player
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
</style>
