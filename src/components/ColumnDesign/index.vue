<template>
  <div class="columnDesign-box">
    <column-main ref="columnMain" :conf="columnData" :modelType="modelType"
      v-show="currentTab==='pc'" />
    <column-main-app ref="columnMainApp" :conf="appColumnData" :modelType="modelType"
      v-show="currentTab==='app'" />
    <div class="head-tabs">
      <el-button icon="icon-ym icon-ym-pc" :class="{'unActive-btn':currentTab!=='pc'}" type="text"
        @click="currentTab='pc'" size="medium">桌面端</el-button>
      <el-button icon="icon-ym icon-ym-mobile" :class="{'unActive-btn':currentTab!=='app'}"
        type="text" @click="currentTab='app'" size="medium">移动端</el-button>
    </div>
  </div>
</template>
<script>
import ColumnMain from './main'
import ColumnMainApp from './mainApp'
export default {
  name: 'columnDesign-box',
  props: {
    columnData: {
      type: Object,
      default: () => { }
    },
    appColumnData: {
      type: Object,
      default: () => { }
    },
    modelType: ''
  },
  components: { ColumnMain, ColumnMainApp },
  data() {
    return {
      currentTab: 'pc',
    }
  },
  created() {
  },
  methods: {
    /**
      * 供父组件使用 获取列表JSON
    */
    getData() {
      return new Promise((resolve, reject) => {
        let columnData = this.$refs.columnMain.getData()
        if (!columnData) reject({ msg: '', target: 2 })
        let appColumnData = this.$refs.columnMainApp.getData()
        resolve({ columnData, appColumnData, target: 2 })
      })
    },
  }
}
</script>
<style lang="scss" scoped>
.columnDesign-box {
  width: 100%;
  height: 100%;
  position: relative;
  .head-tabs {
    position: absolute;
    left: 0;
    top: 0;
    width: calc(100% - 350px);
    height: 42px;
    border-bottom: 1px solid #dcdfe6;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 10px;
    z-index: 100;
    border-radius: 4px 4px 0 0;
    .el-button + .el-button {
      margin-left: 15px;
    }
    .unActive-btn {
      color: #606266 !important;
      &:hover {
        color: #1890ff !important;
      }
    }
    >>> i {
      font-size: 20px;
      vertical-align: middle;
      position: relative;
      top: -1px;
    }
  }
}
</style>