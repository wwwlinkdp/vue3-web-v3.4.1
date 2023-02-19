<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <el-image class="sidebar-logo" :src="define.comUrl+sysConfig.logoIcon"
          v-if="sysConfig && sysConfig.logoIcon">
          <template slot="error">
            <img class="sidebar-logo" src="@/assets/images/jnpf.png" alt="">
          </template>
        </el-image>
        <img src="@/assets/images/jnpf.png" class="sidebar-logo" v-else />
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <el-image class="sidebar-logo" :src="define.comUrl+sysConfig.navigationIcon"
          v-if="sysConfig && sysConfig.navigationIcon">
          <template slot="error">
            <img src="@/assets/images/jnpf2.png" class="sidebar-logo"
              v-if="slideClass==='lightWhite'" />
            <img src="@/assets/images/jnpf1.png" class="sidebar-logo" v-else />
          </template>
        </el-image>
        <template v-else>
          <img src="@/assets/images/jnpf2.png" class="sidebar-logo"
            v-if="slideClass==='lightWhite'" />
          <img src="@/assets/images/jnpf1.png" class="sidebar-logo" v-else />
        </template>
      </router-link>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'SidebarLogo',
  computed: {
    ...mapState({
      slideClass: state => state.settings.slideClass,
    }),
    sysConfig() {
      return this.$store.state.settings.sysConfig
    }
  },
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 60px;
  line-height: 60px;
  background: #031e39;
  text-align: center;
  overflow: hidden;
  .sidebar-logo-link {
    height: 100%;
    width: 100%;

    .sidebar-logo {
      height: 100%;
      width: 100%;
    }
  }
}
</style>