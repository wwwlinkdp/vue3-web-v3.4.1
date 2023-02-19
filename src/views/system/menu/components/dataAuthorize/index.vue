<template>
  <div>
    <el-drawer :title="dialogTitle" :visible.sync="dataAuthorizeListDrawer" :wrapperClosable="false"
      ref="drawer" size="700px" class="JNPF-common-drawer">
      <div class="JNPF-flex-main">
        <el-tabs type="border-card" v-model="tabActiveName" @tab-click="handleClick"
          class="JNPF-flex-tabs">
          <el-tab-pane label="方案管理" name="dataAuthorizeScheme">
            <div class="JNPF-common-head">
              <topOpts @add="addOrUpdateHandle('')">
                <el-dropdown style="margin-left: 10px">
                  <el-button icon="el-icon-plus" :loading="loading" type="text">
                    常用方案<i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="addHandle('allData')">全部数据</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </topOpts>
              <div class="JNPF-common-head-right">
                <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
                  <el-link icon="icon-ym icon-ym-Refresh
                  JNPF-common-head-icon" :underline="false" @click="getAuthorizeSchemeList()" />
                </el-tooltip>
              </div>
            </div>
            <JNPF-table v-loading="listLoading" :data="dataAuthorizeSchemeList" row-key="id"
              default-expand-all :tree-props="{ children: 'children', hasChildren: '' }">
              <el-table-column prop="fullName" label="方案名称" width="160" />
              <el-table-column prop="conditionText" label="过滤条件" />
              <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                  <tableOpts :editDisabled="scope.row.enCode === 'jnpf_alldata'"
                    @edit="addOrUpdateHandle(scope.row.id)" @del="handleDel(scope.row.id)" />
                </template>
              </el-table-column>
            </JNPF-table>
          </el-tab-pane>
          <el-tab-pane label="字段管理" name="dataAuthorize">
            <div class="JNPF-common-head">
              <topOpts @add="addOrUpdateHandle('')">
                <el-button v-if="menuType === 2" type="text" icon="icon-ym icon-ym-dbLink"
                  @click="addDataConnect" class="btn-sty">
                  数据连接
                </el-button>
              </topOpts>
              <div class="JNPF-common-head-right">
                <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
                  <el-link icon="icon-ym icon-ym-Refresh
                  JNPF-common-head-icon" :underline="false" @click="getAuthorizeList()" />
                </el-tooltip>
              </div>
            </div>
            <JNPF-table v-loading="dataListLoading" :data="dataAuthorizeList" row-key="id"
              default-expand-all :tree-props="{ children: 'children', hasChildren: '' }">
              <el-table-column prop="bindTable" label="数据库表" width="120" v-if="menuType == 2" />
              <el-table-column prop="enCode" label="字段名称" />
              <el-table-column prop="fullName" label="字段说明" show-overflow-tooltip />
              <el-table-column prop="type" label="字段类型" width="70" />
              <el-table-column prop="conditionSymbolName" label="条件符号" show-overflow-tooltip />
              <el-table-column prop="conditionText" label="条件内容" width="120">
                <template slot-scope="scope">
                  <span v-if="scope.row.conditionText === 'text'">任意文本</span>
                  <span v-if="scope.row.conditionText === '@userId'">当前用户</span>
                  <span v-if="scope.row.conditionText === '@organizeId'">当前组织</span>
                  <span v-if="
                      scope.row.conditionText ===
                        '@organizationAndSuborganization'
                    ">当前组织及子组织</span>
                  <span v-if="scope.row.conditionText === '@userAraSubordinates'">当前用户及下属</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template slot-scope="scope">
                  <tableOpts @edit="addOrUpdateHandle(scope.row.id)"
                    @del="handleDel(scope.row.id)" />
                </template>
              </el-table-column>
            </JNPF-table>
          </el-tab-pane>
        </el-tabs>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
      </span>
    </el-drawer>
    <DataSchemeForm v-if="dataSchemeFormVisible" ref="DataSchemeForm"
      @refreshDataList="getAuthorizeSchemeList" />
    <DataAuthorizeForm v-if="dataAuthorizeFormVisible" ref="DataAuthorizeForm"
      @refreshDataList="getAuthorizeList" />
    <DataConnectForm v-if="dataConnectFormVisible" ref="DataConnectForm"
      @refreshDataList="getConnectList" />
  </div>
</template>
<script>
import {
  getDataAuthorizeSchemeList,
  getDataAuthorizeList,
  delDataScheme,
  delDataAuthorize,
  createDataScheme
} from "@/api/system/dataAuthorize";
import { getFieldNameList } from "@/api/system/menu";
import { getDataSourceListAll } from "@/api/systemData/dataSource";
import DataSchemeForm from "./DataSchemeForm";
import DataAuthorizeForm from "./DataAuthorizeForm";
import DataConnectForm from "../connectForm";
export default {
  components: {
    DataSchemeForm,
    DataAuthorizeForm,
    DataConnectForm
  },
  data() {
    return {
      tabActiveName: "dataAuthorizeScheme",
      dataAuthorizeListDrawer: false,
      dialogTitle: "",
      moduleId: "",
      loading: false,
      btnLoading: false,
      listLoading: false,
      dataListLoading: false,
      dataAuthorizeSchemeList: [],
      dataAuthorizeList: [],
      dataSchemeFormVisible: false,
      dataAuthorizeFormVisible: false,
      dataConnectFormVisible: false,
      menuType: 2,
      dbOptions: [],
      dbList: [],
      tableName: ""
    };
  },
  methods: {
    init(moduleId, fullName, type) {
      this.menuType = type;
      this.dataAuthorizeListDrawer = true;
      this.moduleId = moduleId;
      this.tabActiveName = "dataAuthorizeScheme";
      this.dialogTitle = `数据权限 - ${fullName}`;
      this.dbList = [];
      this.dbOptions = [];
      this.$nextTick(() => {
        if (this.$refs["DataConnectForm"]) {
          this.$refs["DataConnectForm"].dataForm.dataSelect = "";
        }
        this.listLoading = true;
        this.dataListLoading = true;
        this.getAuthorizeSchemeList();
      });
      if (this.menuType === 3) {
        getFieldNameList(this.moduleId, "DataAuthorize").then(res => {
          this.dbList = res.data || [];
        });
      }
    },
    getConnectList(data, tableName) {
      this.tableName = tableName || "";
      this.dbList = data;
    },
    getAuthorizeSchemeList() {
      // 获取方案管理列表
      getDataAuthorizeSchemeList(this.moduleId)
        .then(res => {
          this.dataAuthorizeSchemeList = res.data.list;
          this.listLoading = false;
          this.btnLoading = false;
        })
        .catch(() => {
          this.listLoading = false;
          this.btnLoading = false;
        });
    },
    getAuthorizeList() {
      // 获取字段列表
      getDataAuthorizeList(this.moduleId)
        .then(res => {
          this.dataAuthorizeList = res.data.list;
          this.dataListLoading = false;
          this.btnLoading = false;
        })
        .catch(() => {
          this.dataListLoading = false;
          this.btnLoading = false;
        });
    },
    handleClick() {
      this.btnLoading = false;
      const activeTab = this.tabActiveName;
      if (activeTab === "dataAuthorizeScheme") {
        this.getAuthorizeSchemeList();
      } else {
        this.getAuthorizeList();
        if (this.menuType === 2) {
          this.getDataSourceListAll();
        }
      }
    },
    handleReLoad() {
      this.btnLoading = true;
      const activeTab = this.tabActiveName;
      if (activeTab === "dataAuthorizeScheme") {
        this.getAuthorizeSchemeList();
      } else {
        this.getAuthorizeList();
      }
    },
    getDataSourceListAll() {
      getDataSourceListAll().then(res => {
        const list = res.data.list || []
        this.dbOptions = list.filter(o => o.children && o.children.length);
      })
    },
    //数据连接
    addDataConnect() {
      this.dataConnectFormVisible = true;
      this.$nextTick(() => {
        this.$refs.DataConnectForm.init(this.dbOptions, 0);
      });
    },
    //新增,编辑
    addOrUpdateHandle(id) {
      const activeTab = this.tabActiveName;
      if (activeTab === "dataAuthorizeScheme") {
        this.dataSchemeFormVisible = true;
        this.$nextTick(() => {
          this.$refs.DataSchemeForm.init(this.moduleId, id);
        });
      } else {
        this.dataAuthorizeFormVisible = true;
        this.$nextTick(() => {
          this.$refs.DataAuthorizeForm.init(
            this.moduleId,
            id,
            this.menuType,
            this.dbList,
            this.tableName
          );
        });
      }
    },
    addHandle() {
      let isAllData = this.dataAuthorizeSchemeList.filter(
        o => o.enCode === "jnpf_alldata"
      );
      if (!!isAllData.length)
        return this.$message({
          message: "该方案已新增，不可重复添加",
          type: "error",
          duration: 1500
        });
      if (this.tabActiveName === "dataAuthorizeScheme") {
        let data = {
          moduleId: this.moduleId,
          enCode: "jnpf_alldata",
          fullName: "全部数据"
        };
        createDataScheme(data)
          .then(res => {
            this.$message({
              message: res.msg,
              type: "success",
              duration: 1500,
              onClose: () => {
                this.btnLoading = false;
              }
            });
            this.getAuthorizeSchemeList();
          })
          .catch(() => {
            this.btnLoading = false;
          });
      }
    },
    handleDel(id) {
      this.$confirm(this.$t("common.delTip"), this.$t("common.tipTitle"), {
        type: "warning"
      })
        .then(() => {
          const delMethod =
            this.tabActiveName === "dataAuthorizeScheme"
              ? delDataScheme
              : delDataAuthorize;
          delMethod(id).then(res => {
            this.$message({
              type: "success",
              message: res.msg,
              duration: 1500,
              onClose: () => {
                this.handleReLoad();
              }
            });
          });
        })
        .catch(() => { });
    }
  }
};
</script>
<style lang="scss" scoped>
.JNPF-flex-main {
  .el-tabs--border-card {
    border: none;
    box-shadow: none;
    >>> .el-tabs__content {
      padding: 0 !important;
    }
  }
}
.btn-sty {
  vertical-align: top;
  /* height: 33px; */
  line-height: 29px;
  padding: 0;
}
.JNPF-flex-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  >>> .el-tabs__content {
    flex: 1;
    .el-tab-pane {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
