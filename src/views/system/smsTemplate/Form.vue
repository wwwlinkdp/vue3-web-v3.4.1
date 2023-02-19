<template>
  <transition name="el-zoom-in-center">
    <div class="JNPF-preview-main flow-form-main">
      <div class="JNPF-common-page-header">
        <el-page-header @back="goBack" :content="!dataForm.id ? '新建短信模板' : '编辑短信模板'" />
        <div class="options">
          <el-button type="primary" @click="dataFormSubmit()" :loading="btnLoading">
            {{$t('common.confirmButton')}}</el-button>
          <el-button @click="goBack()">{{$t('common.cancelButton')}}</el-button>
        </div>
      </div>
      <el-row class="main" v-loading="loading">
        <el-col :span="12" :offset="6">
          <el-form :model="dataForm" :rules="dataRule" ref="dataForm" class="mt-20"
            label-width="110px" @submit.native.prevent>
            <jnpf-form-tip-item label="短信厂家" prop="company">
              <el-radio-group v-model="dataForm.company" @change="onCompanyChange">
                <el-radio-button :label="1">阿里</el-radio-button>
                <el-radio-button :label="2">腾讯</el-radio-button>
              </el-radio-group>
            </jnpf-form-tip-item>
            <jnpf-form-tip-item label="模板名称" prop="fullName">
              <el-input v-model="dataForm.fullName" clearable placeholder="模板名称" />
            </jnpf-form-tip-item>
            <jnpf-form-tip-item label="模板编码" prop="enCode">
              <el-input v-model="dataForm.enCode" clearable placeholder="模板编码" />
            </jnpf-form-tip-item>
            <template v-if="dataForm.company===1">
              <jnpf-form-tip-item label="签名名称" prop="signContent"
                tip-label="选择国内消息或国际/港澳台消息，在签名管理⻚⾯获取">
                <el-input v-model="dataForm.signContent" clearable placeholder="签名名称" />
              </jnpf-form-tip-item>
              <jnpf-form-tip-item label="模版Code" prop="templateId"
                tip-label="选择国内消息或国际/港澳台消息，在模板管理⻚⾯查看模板CODE">
                <el-input v-model="dataForm.templateId" clearable placeholder="模版Code" />
              </jnpf-form-tip-item>
              <jnpf-form-tip-item label="Endpoint" prop="endpoint" tip-label="服务接入点">
                <el-input v-model="dataForm.endpoint" clearable placeholder="Endpoint" />
              </jnpf-form-tip-item>
            </template>
            <template v-if="dataForm.company===2">
              <jnpf-form-tip-item label="签名ID" prop="signId" tip-label="选择国内短信或国际/港澳台短信，在签名管理⻚⾯获取">
                <el-input v-model="dataForm.signId" clearable placeholder="签名ID" />
              </jnpf-form-tip-item>
              <jnpf-form-tip-item label="模版ID" prop="ttTemplateId"
                tip-label="选择择国内短信或国际/港澳台短信，在正⽂模板管理⻚⾯获取">
                <el-input v-model="dataForm.ttTemplateId" clearable placeholder="模版ID" />
              </jnpf-form-tip-item>
              <jnpf-form-tip-item label="地域域名" prop="domain"
                tip-label="默认是接⼊地域域名为sms.tencentcloudapi.com,也⽀持指定地域域名访问">
                <el-input v-model="dataForm.domain" clearable placeholder="地域域名" />
              </jnpf-form-tip-item>
              <jnpf-form-tip-item label="地域参数" prop="region" tip-label="取值如： ap-beijing（华北地区(北京)）">
                <el-input v-model="dataForm.region" clearable placeholder="地域参数" />
              </jnpf-form-tip-item>
            </template>
            <jnpf-form-tip-item label="模板验证" tip-label="短信模板可用性测试">
              <el-button @click="showDialog()" :loading="testLoading">测试</el-button>
            </jnpf-form-tip-item>
            <jnpf-form-tip-item label="状态" prop="enabledMark">
              <el-switch v-model="dataForm.enabledMark" :active-value="1" :inactive-value="0" />
            </jnpf-form-tip-item>
          </el-form>
        </el-col>
      </el-row>
      <el-dialog title="测试" :visible.sync="testVisible" :close-on-click-modal="false"
        class="JNPF-dialog JNPF-dialog_center" lock-scroll append-to-body width="600px">
        <el-form :model="testForm" :rules="testRule" ref="testForm" label-width="80px">
          <JNPF-table :data="testList">
            <el-table-column prop="field" label="参数名称" width="100" />
            <el-table-column prop="value" label="参数赋值">
              <template slot-scope="scope">
                <el-input v-model="scope.row.value" placeholder="参数赋值"></el-input>
              </template>
            </el-table-column>
          </JNPF-table>
          <el-form-item></el-form-item>
          <el-form-item label="接收号码" prop="phoneNumbers">
            <el-input v-model="testForm.phoneNumbers" placeholder="接收号码"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="testVisible=false">{{$t('common.cancelButton')}}
          </el-button>
          <el-button type="primary" @click="test" :loading="testBtnLoading">测试</el-button>
        </span>
      </el-dialog>
    </div>
  </transition>
</template>

<script>
import { getInfo, Update, Create, getTemplate, testSent } from '@/api/system/smsTemplate'

export default {
  data() {
    return {
      dataForm: {
        id: '',
        enabledMark: 1,
        company: 1,
        enCode: '',
        fullName: '',
        signContent: '',
        templateId: '',
        endpoint: 'dysmsapi.aliyuncs.com',
        signId: '',
        ttTemplateId: '',
        domain: 'sms.tencentcloudapi.com',
        region: 'ap-beijing'
      },
      dataRule: {
        company: [
          { required: true, message: '短信厂家不能为空', trigger: 'blur' },
        ],
        fullName: [
          { required: true, message: '模板名称不能为空', trigger: 'blur' },
        ],
        enCode: [
          { required: true, message: '模板编码不能为空', trigger: 'blur' },
        ],
        signContent: [
          { required: true, message: '签名名称不能为空', trigger: 'blur' },
        ],
        templateId: [
          { required: true, message: '模版Code不能为空', trigger: 'blur' },
        ],
        signId: [
          { required: true, message: '签名ID不能为空', trigger: 'blur' },
        ],
        ttTemplateId: [
          { required: true, message: '模版ID不能为空', trigger: 'blur' },
        ],
      },
      testRule: {
        phoneNumbers: [
          { required: true, message: '接收号码不能为空', trigger: 'blur' }
        ]
      },
      testForm: {
        phoneNumbers: ''
      },
      testVisible: false,
      btnLoading: false,
      testBtnLoading: false,
      testLoading: false,
      loading: false,
      testList: []
    }
  },
  methods: {
    goBack() {
      this.$emit('close')
    },
    init(id) {
      this.dataForm.id = id || ''
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.loading = true
          getInfo(this.dataForm.id).then(res => {
            this.dataForm = res.data
            if (this.dataForm.company == 2) {
              this.$set(this.dataForm, 'signId', this.dataForm.signContent)
              this.$set(this.dataForm, 'ttTemplateId', this.dataForm.templateId)
              this.$set(this.dataForm, 'domain', this.dataForm.endpoint)
            } else {
              this.dataForm.domain = 'sms.tencentcloudapi.com'
              this.dataForm.region = 'ap-beijing'
            }
            this.loading = false
          }).catch(() => {
            this.loading = false
          })
        }
      })
    },
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.btnLoading = true
          if (this.dataForm.company == 2) {
            this.dataForm.signContent = this.dataForm.signId
            this.dataForm.templateId = this.dataForm.ttTemplateId
            this.dataForm.endpoint = this.dataForm.domain
          }
          const formMethod = this.dataForm.id ? Update : Create
          formMethod(this.dataForm).then((res) => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.visible = false
                this.btnLoading = false
                this.$emit('close', true)
              }
            })
          }).catch(() => { this.btnLoading = false })
        }
      })
    },
    onCompanyChange() {
      this.$refs['dataForm'].clearValidate()
    },
    showDialog() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.dataForm.company == 2) {
            this.dataForm.signContent = this.dataForm.signId
            this.dataForm.templateId = this.dataForm.ttTemplateId
            this.dataForm.endpoint = this.dataForm.domain
          }
          this.testLoading = true
          getTemplate(this.dataForm).then(res => {
            this.testList = res.data.map(o => ({
              field: o,
              value: ''
            }))
            this.testVisible = true
            this.testLoading = false
            this.$nextTick(() => {
              this.$refs['testForm'].resetFields()
            })
          }).catch(() => { this.testLoading = false })
        }
      })
    },
    test() {
      this.$refs['testForm'].validate((valid) => {
        if (valid) {
          this.testBtnLoading = true
          let parameters = {}
          for (let i = 0; i < this.testList.length; i++) {
            parameters[this.testList[i].field] = this.testList[i].value
          }
          let query = {
            ...this.dataForm,
            ...this.testForm,
            parameters
          }
          testSent(query).then(res => {
            this.$message({
              message: res.msg,
              type: 'success',
              duration: 1500,
              onClose: () => {
                this.testBtnLoading = false
                this.testVisible = false
              }
            })
          }).catch(() => { this.testBtnLoading = false })
        }
      })
    }
  }
}
</script>