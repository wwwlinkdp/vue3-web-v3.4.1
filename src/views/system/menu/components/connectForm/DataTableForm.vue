<template>
  <el-dialog title="数据选择" :close-on-click-modal="false" width="700px"
    class="JNPF-dialog JNPF-dialog_center table-dialog" lock-scroll append-to-body v-bind="$attrs"
    v-on="$listeners" @open="onOpen">
    <el-row class="JNPF-common-search-box" :gutter="16">
      <el-form @submit.native.prevent>
        <el-col :span="10">
          <el-form-item label="关键词">
            <el-input v-model="keyword" placeholder="请输入关键词查询" clearable
              @keyup.enter.native="initData()" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="initData()">
              {{ $t("common.search") }}</el-button>
            <el-button icon="el-icon-refresh-right" @click="refresh()">{{ $t("common.reset") }}
            </el-button>
          </el-form-item>
        </el-col>
      </el-form>
      <div class="JNPF-common-search-box-right">
        <el-tooltip effect="dark" :content="$t('common.refresh')" placement="top">
          <el-link icon="icon-ym icon-ym-Refresh JNPF-common-head-icon" :underline="false"
            @click="initData()" />
        </el-tooltip>
      </div>
    </el-row>
    <JNPF-table v-loading="listLoading" :data="list" :border="false" highlight-current-row
      @row-click="rowClick" :hasNO="false">
      <el-table-column width="35">
        <template slot-scope="scope">
          <el-radio :label="scope.row.table" v-model="checked">&nbsp;</el-radio>
        </template>
      </el-table-column>
      <el-table-column type="index" width="50" label="序号" align="center" />
      <el-table-column prop="table" label="表名" show-overflow-tooltip />
      <el-table-column prop="sum" label="总数" width="90" />
      <el-table-column prop="tableName" label="说明" width="150" show-overflow-tooltip />
    </JNPF-table>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">{{
        $t("common.cancelButton")
      }}</el-button>
      <el-button type="primary" @click="select()">{{
        $t("common.confirmButton")
      }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { DataModelList } from "@/api/systemData/dataModel";
export default {
  props: ["dbLinkId", "dataSelect"],
  data() {
    return {
      listLoading: true,
      keyword: "",
      list: [],
      checked: "",
      checkedRow: {},
    };
  },
  methods: {
    onOpen() {
      this.keyword = "";
      this.checked = "";
      this.checkedRow = {};
      this.initData();
    },
    closeDialog() {
      this.$emit("update:visible", false);
    },
    refresh() {
      this.initData();
    },
    initData() {
      this.listLoading = true;
      if (!this.dataSelect) {
        this.checked = "";
        this.checkedRow = {};
      }
      const dbLinkId = this.dbLinkId || "0";
      DataModelList(dbLinkId, { keyword: this.keyword }).then((res) => {
        this.list = res.data.list;
        this.listLoading = false;
      });
    },
    select() {
      if (!this.checkedRow) return;
      this.$emit("closeForm", this.checked, this.checkedRow);
      this.$emit("update:visible", false);
    },
    rowClick(row) {
      this.checked = row.table;
      this.checkedRow = row;
    },
  },
};
</script>
<style lang="scss" scoped>
.table-dialog {
  >>> .el-dialog__body {
    height: 70vh;
    padding: 0 !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .JNPF-common-search-box {
      margin-bottom: 0;
      .JNPF-common-search-box-right {
        padding: 10px 10px 0 0;
      }
    }
  }
}
</style>
