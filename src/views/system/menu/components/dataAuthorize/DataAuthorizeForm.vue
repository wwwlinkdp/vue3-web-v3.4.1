<template>
  <el-dialog :title="!dataForm.id ? '新建字段' : '编辑字段'" :close-on-click-modal="false"
    :close-on-press-escape="false" :visible.sync="visible" lock-scroll
    class="JNPF-dialog JNPF-dialog_center" width="630px">
    <el-form ref="dataForm" :model="dataForm" :rules="dataRule" label-width="80px"
      v-loading="formLoading" class="menuForm">
      <el-form-item label="字段名称" prop="enCode">
        <el-select v-if="enCodeOptions.length" v-model="dataForm.enCode" placeholder="请选择字段名称"
          clearable @change="onEnCodeChange">
          <el-option v-for="item in enCodeOptions" :key="item.field" :label="item.field"
            :value="item.field">
          </el-option>
        </el-select>
        <el-input v-model="dataForm.enCode" placeholder="输入字段名称" v-else />
      </el-form-item>
      <el-form-item label="字段规则" prop="fieldRule">
        <el-select v-model="dataForm.fieldRule" placeholder="请选择字段名称" clearable>
          <el-option v-for="item in fieldRuleOptions" :key="item.value" :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="字段说明" prop="fullName">
        <el-input v-model="dataForm.fullName" placeholder="输入字段说明" />
      </el-form-item>
      <el-form-item label="字段类型" prop="type">
        <el-select v-model="dataForm.type" placeholder="请选择" clearable>
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="条件符号" prop="conditionSymbol">
        <el-select v-model="conditionSymbol" multiple placeholder="请选择">
          <el-option v-for="item in conditionSymbolOptions" :key="item.value" :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="条件内容" prop="conditionText">
        <el-select v-model="dataForm.conditionText" placeholder="请选择" clearable>
          <el-option v-for="item in conditionTextOptions" :key="item.value" :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="description">
        <el-input v-model="dataForm.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">{{$t("common.cancelButton")}}</el-button>
      <el-button type="primary" :loading="btnLoading" @click="dataFormSubmit()">
        {{ $t("common.confirmButton") }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {
  createDataAuthorize,
  updateDataAuthorize,
  getDataAuthorizeInfo
} from "@/api/system/dataAuthorize";

export default {
  data() {
    return {
      visible: false,
      formLoading: false,
      btnLoading: false,
      typeOptions: [
        {
          value: "string",
          label: "string"
        },
        {
          value: "int",
          label: "int"
        },
        {
          value: "double",
          label: "double"
        },
        {
          value: "varchar",
          label: "varchar"
        },
        {
          value: "datetime",
          label: "datetime"
        },
        {
          value: "text",
          label: "text"
        },
        {
          value: "bigint",
          label: "bigint"
        }
      ],
      fieldRuleOptions: [
        { value: 0, label: "主表规则" },
        { value: 1, label: "副表规则" }
      ],
      conditionTextOptions: [
        {
          value: "text",
          label: "任意文本"
        },
        {
          value: "@organizeId",
          label: "当前组织"
        },
        {
          value: "@organizationAndSuborganization",
          label: "当前组织及子组织"
        },
        {
          value: "@userId",
          label: "当前用户"
        },
        {
          value: "@userAraSubordinates",
          label: "当前用户及下属"
        }
      ],
      conditionSymbolOptions: [
        {
          value: "Equal",
          label: "等于"
        },
        {
          value: "NotEqual",
          label: "不等于"
        },
        {
          value: "GreaterThan",
          label: "大于"
        },
        {
          value: "GreaterThanOrEqual",
          label: "大于等于"
        },
        {
          value: "LessThan",
          label: "小于"
        },
        {
          value: "LessThanOrEqual",
          label: "小于等于"
        }
      ],
      dataForm: {
        id: "",
        moduleId: "",
        fullName: "",
        enCode: "",
        type: "",
        conditionSymbol: "",
        conditionText: "",
        description: "",
        fieldRule: 0
      },
      conditionSymbol: [],
      menuType: 2,
      dataRule: {
        enCode: [
          { required: true, message: "字段名称不能为空", trigger: "blur" }
        ],
        fieldRule: [
          { required: true, message: "主表规则不能为空", trigger: "blur" }
        ],
        fullName: [
          { required: true, message: "字段说明不能为空", trigger: "blur" }
        ],
        type: [{ required: true, message: "请选择字段类型", trigger: "blur" }],
        conditionSymbol: [
          { required: true, message: "请选择条件符号", trigger: "blur" }
        ],
        conditionText: [
          { required: true, message: "请选择条件内容", trigger: "blur" }
        ]
      },
      enCodeOptions: []
    };
  },
  methods: {
    init(moduleId, id, menuType, dbList, tableName) {
      this.menuType = menuType;
      this.dataForm.id = id || "";
      this.dataForm.moduleId = moduleId;
      this.conditionSymbol = [];
      this.visible = true;
      this.formLoading = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].resetFields();
        this.enCodeOptions = dbList;
        this.dataForm.bindTable = tableName;
        // 获取字段数据
        if (this.dataForm.id) {
          getDataAuthorizeInfo(this.dataForm.id).then(res => {
            this.dataForm = res.data;
            this.conditionSymbol = res.data.conditionSymbol
              ? res.data.conditionSymbol.split(",")
              : [];
          });
        }
        this.formLoading = false;
      });
    },
    onEnCodeChange(e) {
      let objVal;
      this.dataForm.fullName = "";
      this.dataForm.type = "";
      if (!!e) {
        this.enCodeOptions.forEach(o => {
          if (o.field === e) {
            objVal = {
              fullName: o.fieldName,
              type: o.dataType
            };
            return objVal;
          }
        });
        this.dataForm.fullName = objVal["fullName"];
        this.dataForm.type = objVal["type"];
      }
    },
    dataFormSubmit() {
      this.dataForm.conditionSymbol = this.conditionSymbol.join();
      this.$refs["dataForm"].validate(valid => {
        if (valid) {
          this.btnLoading = true;
          const formMethod = this.dataForm.id
            ? updateDataAuthorize
            : createDataAuthorize;
          formMethod(this.dataForm)
            .then(res => {
              this.$message({
                message: res.msg,
                type: "success",
                duration: 1500,
                onClose: () => {
                  this.visible = false;
                  this.btnLoading = false;
                  this.$emit("refreshDataList");
                }
              });
            })
            .catch(() => {
              this.btnLoading = false;
            });
        }
      });
    }
  }
};
</script>
