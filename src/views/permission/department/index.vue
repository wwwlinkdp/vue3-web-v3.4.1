<template>
  <div class="JNPF-common-layout">
    <div class="JNPF-common-layout-left">
      <div class="JNPF-common-title">
        <h2>{{$t('common.organization')}}</h2>
        <span class="options">
          <el-dropdown>
            <el-link icon="icon-ym icon-ym-mpMenu" :underline="false" />
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="getOrganizeList()">刷新数据</el-dropdown-item>
              <el-dropdown-item @click.native="toggleExpand(true)">展开全部</el-dropdown-item>
              <el-dropdown-item @click.native="toggleExpand(false)">折叠全部</el-dropdown-item>
              <el-dropdown-item @click.native="showDiagram">架构图</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </span>
      </div>
      <div class="JNPF-common-tree-search-box">
        <el-input placeholder="输入关键字" v-model="filterText" suffix-icon="el-icon-search" clearable />
      </div>
      <el-scrollbar class="JNPF-common-el-tree-scrollbar" v-loading="treeLoading">
        <el-tree ref="treeBox" :data="treeData" :props="defaultProps" :default-expand-all="expands"
          highlight-current :expand-on-click-node="false" node-key="id"
          @node-click="handleNodeClick" class="JNPF-common-el-tree" v-if="refreshTree"
          :filter-node-method="filterNode">
          <span class="custom-tree-node" slot-scope="{ data }" :title="data.fullName">
            <i :class="data.icon" />
            <span class="text" :title="data.fullName">{{data.fullName}}</span>
          </span>
        </el-tree>
      </el-scrollbar>
    </div>
    <div class="JNPF-common-layout-center JNPF-flex-main">
      <el-row class="JNPF-common-search-box" :gutter="16">
        <el-form @submit.native.prevent>
          <el-col :span="6">
            <el-form-item :label="$t('common.keyword')">
              <el-input v-model="listQuery.keyword" :placeholder="$t('common.enterKeyword')"
                clearable @keyup.enter.native="search()" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="search()">
                {{$t('common.search')}}</el-button>
              <el-button icon="el-icon-refresh-right" @click="reset()">{{$t('common.reset')}}
              </el-button>
            </el-form-item>
          </el-col>
        </el-form>
      </el-row>
      <div class="JNPF-common-layout-main JNPF-flex-main">
        <div class="JNPF-common-head">
          <topOpts @add="addOrUpdateHandle()" />
          <div class="JNPF-common-head-right">
            <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
              <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
                @click="initData()" />
            </el-tooltip>
          </div>
        </div>
        <JNPF-table v-loading="listLoading" :data="tableData" row-key="id" default-expand-all
          :tree-props="{children: 'children', hasChildren: ''}">
          <el-table-column prop="fullName" label="部门名称" />
          <el-table-column prop="enCode" label="部门编码" />
          <el-table-column prop="manager" label="部门主管" />
          <el-table-column prop="creatorTime" label="创建时间" :formatter="jnpf.tableDateFormat"
            width="120" />
          <el-table-column prop="sortCode" label="排序" width="70" align="center" />
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <tableOpts @edit="addOrUpdateHandle(scope.row.id)" @del="handleDel(scope.row.id)">
                <el-dropdown hide-on-click>
                  <span class="el-dropdown-link">
                    <el-button size="mini" type="text">
                      {{$t('common.moreBtn')}}<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="openGradeForm(scope.row)">
                      分级管理
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </tableOpts>
            </template>
          </el-table-column>
        </JNPF-table>
      </div>
    </div>
    <Form v-if="formVisible" ref="Form" @refreshDataList="refresh" />
    <Diagram v-if="diagramVisible" ref="Diagram" @close="diagramVisible = false" />
    <gradeForm v-if="gradeFormVisible" ref="gradeForm" @close="gradeFormVisible=false" />
  </div>
</template>
<script>
import {
  getDepartmentSelector,
  getDepartmentList,
  delDepartment
} from '@/api/permission/department'
import Diagram from '@/views/permission/user/Diagram'
import Form from './Form'
import GradeForm from '../organize/GradeForm'

export default {
  name: 'permission-department',
  components: { Form, Diagram, GradeForm },
  data() {
    return {
      treeData: [],
      tableData: [],
      treeLoading: true,
      btnLoading: false,
      listLoading: true,
      companyId: '',
      listQuery: {
        keyword: ''
      },
      defaultProps: {
        children: 'children',
        label: 'fullName'
      },
      formVisible: false,
      diagramVisible: false,
      typeListVisible: false,
      typeVisible: false,
      gradeFormVisible: false,
      expands: true,
      refreshTree: true,
      filterText: ''
    }
  },
  watch: {
    filterText(val) {
      this.$refs.treeBox.filter(val)
    }
  },
  created() {
    this.getOrganizeList(true)
  },
  methods: {
    showDiagram() {
      this.diagramVisible = true
      this.$nextTick(() => {
        this.$refs.Diagram.init()
      })
    },
    toggleExpand(expands) {
      this.refreshTree = false
      this.expands = expands
      this.$nextTick(() => {
        this.refreshTree = true
        this.$nextTick(() => {
          this.$refs.treeBox.setCurrentKey(this.companyId)
        })
      })
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.fullName.indexOf(value) !== -1;
    },
    getOrganizeList(isInit) {
      this.treeLoading = true
      getDepartmentSelector().then(res => {
        this.treeData = res.data.list
        this.$nextTick(() => {
          if (!this.treeData.length) {
            this.treeLoading = false
            this.listLoading = false
            return
          }
          if (isInit) this.companyId = this.treeData[0].id
          this.$refs.treeBox.setCurrentKey(this.companyId)
          this.treeLoading = false
          if (isInit) this.initData()
        })
      }).catch(() => {
        this.treeLoading = false
      })
    },
    initData() {
      this.listLoading = true
      getDepartmentList(this.companyId, this.listQuery).then(res => {
        this.tableData = res.data.list
        this.listLoading = false
        this.btnLoading = false
      }).catch(() => {
        this.listLoading = false
        this.btnLoading = false
      })
    },
    handleNodeClick(data) {
      if (this.companyId === data.id) return
      this.companyId = data.id
      this.reset()
    },
    addOrUpdateHandle(id) {
      this.formVisible = true
      this.$nextTick(() => {
        this.$refs.Form.init(id, this.companyId)
      })
    },
    openGradeForm(row) {
      this.gradeFormVisible = true
      this.$nextTick(() => {
        this.$refs.gradeForm.init(row.id, row.fullName)
      })
    },
    search() {
      this.initData()
    },
    refresh() {
      this.getOrganizeList()
      this.initData()
    },
    reset() {
      this.listQuery.keyword = ''
      this.initData()
    },
    handleDel(id) {
      this.$confirm(this.$t('common.delTip'), this.$t('common.tipTitle'), {
        type: 'warning'
      }).then(() => {
        delDepartment(id).then(res => {
          this.$message({
            type: 'success',
            message: res.msg,
            duration: 1500,
            onClose: () => {
              this.$store.commit('generator/SET_COMPANY_TREE', [])
              this.$store.commit('generator/SET_DEP_TREE', [])
              this.initData()
            }
          })
        })
      }).catch(() => { })
    }
  }
}
</script>
