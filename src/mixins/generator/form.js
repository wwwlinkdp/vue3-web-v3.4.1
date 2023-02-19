import { getVisualDevInfo, Update, Create } from '@/api/onlineDev/visualDev'
import commonMixin from '@/mixins/generator/common'
export default {
  mixins: [commonMixin],
  data() {
    return {
      visible: false,
      loading: false,
      activeStep: 0,
      dataForm: {
        id: '',
        fullName: '',
        enCode: '',
        type: 1,
        webType: 2,
        dbLinkId: '0',
        sortCode: 0,
        state: 1,
        category: '',
        description: "",
        tables: ''
      },
      dataRule: {
        fullName: [
          { required: true, message: '名称不能为空', trigger: 'blur' },
        ],
        enCode: [
          { required: true, message: '编码不能为空', trigger: 'blur' },
          { validator: this.formValidate('enCode'), trigger: 'blur' },
        ],
        category: [
          { required: true, message: '分类不能为空', trigger: 'change' },
        ]
      },
      stepLoading: false,
      maxStep: 2,
      tables: [],
      defaultTable: [],
      formVisible: false,
      btnLoading: false,
      formData: null,
      columnData: null,
      appColumnData: null,
      flowTemplateJson: null,
      categoryList: [],
      dbOptions: [],
      dbType: "MySQL",
      mainTableFields: [],
      relationTable: ""
    }
  },
  methods: {
    init(categoryList, id, type, webType, isToggle) {
      this.categoryList = categoryList
      this.activeStep = 0
      this.tables = []
      this.defaultTable = []
      this.dataForm.id = id || ''
      this.getDbOptions()
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.loading = true
          getVisualDevInfo(this.dataForm.id).then(res => {
            this.dataForm = res.data
            this.dataForm.webType = this.dataForm.webType || 2
            if (isToggle) this.dataForm.webType = webType
            this.maxStep = parseInt(this.dataForm.webType)
            this.formData = this.dataForm.formData && JSON.parse(this.dataForm.formData)
            this.columnData = this.dataForm.columnData && JSON.parse(this.dataForm.columnData)
            this.appColumnData = this.dataForm.appColumnData && JSON.parse(this.dataForm.appColumnData)
            this.flowTemplateJson = this.dataForm.flowTemplateJson && JSON.parse(this.dataForm.flowTemplateJson)
            this.tables = this.dataForm.tables && JSON.parse(this.dataForm.tables) || []
            this.defaultTable = this.dataForm.tables && JSON.parse(this.dataForm.tables) || []
            this.updateFields()
            this.loading = false
          }).catch(() => { this.loading = false })
        } else {
          this.dataForm.type = type
          this.dataForm.webType = webType || 2
          this.maxStep = parseInt(this.dataForm.webType)
        }
      })
    },
    dataFormSubmit() {
      const component = this.getComponent()
      this.$refs[component].getData().then(res => {
        this.btnLoading = true
        if (this.dataForm.webType == 1) {
          this.formData = res.formData
        } else if (this.dataForm.webType == 3) {
          this.flowTemplateJson = res.formData
        } else {
          this.columnData = res.columnData
          this.appColumnData = res.appColumnData
        }
        this.dataForm.tables = JSON.stringify(this.tables)
        this.dataForm.formData = this.formData ? JSON.stringify(this.formData) : null
        this.dataForm.columnData = this.columnData ? JSON.stringify(this.columnData) : null
        this.dataForm.appColumnData = this.appColumnData ? JSON.stringify(this.appColumnData) : null
        this.dataForm.flowTemplateJson = this.flowTemplateJson ? JSON.stringify(this.flowTemplateJson) : null
        const formMethod = this.dataForm.id ? Update : Create
        formMethod(this.dataForm).then((res) => {
          this.$message({
            message: res.msg,
            type: 'success',
            duration: 1500,
            onClose: () => {
              this.closeDialog(true)
            }
          })
        }).catch(() => { this.btnLoading = false })
      }).catch(err => {
        err.msg && this.$message.warning(err.msg)
      })
    },
    next() {
      if (this.activeStep < 1) {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.getDbType()
            const type = this.dataForm.type
            if (!this.tables.length) {
              if (this.defaultTable.length || type == 3 || type == 4) {
                this.$message.warning('请至少选择一个数据表')
                return
              }
              this.$store.commit('generator/SET_TABLE', false)
              this.activeStep += 1
            } else {
              if (!this.exist()) return
              let subTable = this.tables.filter(o => o.typeId == '0')
              this.$store.commit('generator/UPDATE_SUB_TABLE', subTable)
              this.$store.commit('generator/SET_ALL_TABLE', this.tables)
              this.$store.commit('generator/SET_TABLE', true)
              this.$store.commit('generator/UPDATE_FORMITEM_LIST', this.mainTableFields)
              this.activeStep += 1
            }
          }
        })
      } else if (this.activeStep == 1) {
        this.$refs['generator'].getData().then(res => {
          this.formData = res.formData
          this.activeStep += 1
        }).catch(err => {
          err.msg && this.$message.warning(err.msg)
        })
      } else {
        this.$refs['columnDesign'].getData().then(res => {
          this.columnData = res.columnData
          this.appColumnData = res.appColumnData
          this.activeStep += 1
        }).catch(err => {
          err.msg && this.$message.warning(err.msg)
        })
      }
    },
    getComponent() {
      const webType = this.dataForm.webType || 2
      let component = 'columnDesign'
      if (webType == 1) {
        component = 'generator'
      } else if (webType == 3) {
        component = 'process'
      } else {
        component = 'columnDesign'
      }
      return component
    }
  }
}