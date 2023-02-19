<template>
  <div class="UploadFile-container">
    <template v-if="!detailed">
      <el-button size="small" icon="el-icon-upload" @click="uploadFile" :disabled="disabled">
        {{buttonText}}
      </el-button>
      <div class="el-upload__tip" v-if="showTip">
        只能上传不超过{{fileSize}}{{sizeUnit}}的{{acceptText}}文件
      </div>
    </template>
    <template v-if="fileList.length">
      <ul class="el-upload-list el-upload-list el-upload-list--text">
        <li class="el-upload-list__item is-success" v-for="(file,index) in fileList"
          :key="file.fileId" :class="{'el-upload-list__item_detail':detailed}">
          <a class="el-upload-list__item-name" @click="handleClick(file)">
            <i class="el-icon-paperclip"></i>{{file.name}}
          </a>
          <i class="el-icon-view" @click="handlePreview(file)"></i>
          <i class="el-icon-download" @click="handleClick(file)"></i>
          <label class="el-upload-list__item-status-label" :class="{'disabled':disabled}">
            <i class="el-icon-upload-success el-icon-circle-check"></i>
          </label>
          <i class="el-icon-close" v-if="!disabled" @click="handleRemove(index)"></i>
        </li>
      </ul>
    </template>
    <fileUploader ref="fileUploader" v-bind="$props" @fileSuccess="fileSuccess" />
    <Preview :visible.sync="previewVisible" :file="activeFile" />
  </div>
</template>

<script>
import { getDownloadUrl } from '@/api/common'
import Preview from './Preview'
import FileUploader from './vue-simple-uploader/fileUploader'
export default {
  name: 'UploadFile',
  components: { Preview, FileUploader },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'annex'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showTip: {
      type: Boolean,
      default: false
    },
    detailed: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 0
    },
    accept: {
      type: String,
      default: '*'
    },
    buttonText: {
      type: String,
      default: '选择文件'
    },
    sizeUnit: {
      type: String,
      default: 'MB'
    },
    fileSize: {
      default: 5
    }
  },
  data() {
    return {
      fileList: this.value,
      previewVisible: false,
      activeFile: {},
    }
  },
  computed: {
    acceptText() {
      let txt = ''
      switch (this.accept) {
        case 'image/*':
          txt = '图片'
          break;
        case 'video/*':
          txt = '视频'
          break;
        case 'audio/*':
          txt = '音频'
          break;
        case '.xls,.xlsx':
          txt = 'excel'
          break;
        case '.doc,.docx':
          txt = 'word'
          break;
        case '.pdf':
          txt = 'pdf'
          break;
        case '.txt':
          txt = 'txt'
          break;
        default:
          txt = ''
          break;
      }
      return txt
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        this.fileList = val
      }
    }
  },
  methods: {
    handleRemove(index) {
      this.fileList.splice(index, 1)
      this.$emit("input", this.fileList)
      this.$emit('change', this.fileList)
    },
    handleClick(file) {
      // 点击下载文件
      if (!file.fileId) return
      getDownloadUrl(this.type, file.fileId).then(res => {
        this.jnpf.downloadFile(res.data.url)
      })
    },
    handlePreview(file) {
      this.activeFile = file
      this.previewVisible = true
    },
    uploadFile() {
      const isTopLimit = this.limit ? this.value.length >= this.limit : false
      if (isTopLimit) {
        this.$message.error(`当前限制最多可以上传${this.limit}个文件`)
        return false
      }
      this.$refs.fileUploader && this.$refs.fileUploader.openUploader()
    },
    fileSuccess(data) {
      const isTopLimit = this.limit ? this.value.length >= this.limit : false
      if (isTopLimit) {
        this.$message.error(`当前限制最多可以上传${this.limit}个文件`)
        return false
      }
      this.fileList.push(data)
      this.$emit('input', this.fileList)
      this.$emit('change', this.fileList)
    }
  }
}
</script>
<style lang="scss" scoped>
.UploadFile-container {
  position: relative;
  .el-upload__tip {
    line-height: 1.2;
    color: #a5a5a5;
    margin-top: 5px;
  }
}
.el-upload-list__item {
  &.el-upload-list__item_detail:first-child {
    margin-top: 5px !important;
  }
  .el-upload-list__item-name {
    margin-right: 70px;
  }
  &:hover {
    .el-upload-list__item-status-label.disabled {
      display: block !important;
    }
  }
  .el-icon-download {
    display: inline-block;
    position: absolute;
    top: 5px;
    right: 25px;
    cursor: pointer;
    opacity: 0.75;
    color: #606266;
  }
  .el-icon-view {
    display: inline-block;
    position: absolute;
    top: 5px;
    right: 45px;
    cursor: pointer;
    opacity: 0.75;
    color: #606266;
  }
}
</style>