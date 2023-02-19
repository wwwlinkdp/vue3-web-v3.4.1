<template>
  <div id="document-file-uploader">
    <uploader ref="uploader" :options="options" :autoStart="false" @file-added="onFileAdded"
      @file-success="onFileSuccess" @file-progress="onFileProgress" @file-error="onFileError"
      class="uploader-app" @complete="onComplete" :file-status-text="statusText">
      <uploader-unsupport></uploader-unsupport>
      <uploader-btn id="file-uploader-btn" ref="uploadBtn">选择文件</uploader-btn>
      <uploader-list v-show="panelShow">
        <div class="file-panel" slot-scope="{fileList}">
          <div class="file-title">
            <p class="title">上传文件列表</p>
            <div class="operate">
              <i class="el-icon-close" @click="close"></i>
            </div>
          </div>
          <ul class="file-list">
            <li v-for="file in fileList" :key="file.id">
              <uploader-file :class="'file_' + file.id" ref="files" :file="file" :list="true">
                <template slot-scope="props">
                  <FileItem :file="props.file" :list="props.list" />
                </template>
              </uploader-file>
            </li>
            <el-empty description="暂无待上传文件" :image-size="120" v-if="!fileList.length">
            </el-empty>
          </ul>
        </div>
      </uploader-list>
    </uploader>
  </div>
</template>

<script>
import uploadMixin from '@/components/Generator/components/Upload/vue-simple-uploader/mixin'
import { documentMerge } from '@/api/extend/document'

export default {
  props: ['parentId'],
  mixins: [uploadMixin],
  data() {
    return {

    }
  },
  methods: {
    handelSuccess(file) {
      const form = new FormData()
      form.append('identifier', file.uniqueIdentifier)
      form.append('fileName', file.name)
      form.append('fileSize', file.size)
      form.append('fileType', file.getType())
      form.append('extension', file.getExtension())
      form.append('parentId', this.parentId)
      documentMerge(form).then(res => {
        // 自定义完成状态
        this.$set(file, 'customCompleted', true)
        this.$emit('fileSuccess', res.data)
      })
    },
    onComplete() {
      this.uploader.cancel();
      this.panelShow = false;
    }
  }
}
</script>

<style lang="scss" scoped>
#document-file-uploader {
  position: fixed;
  z-index: 20;
  right: 10px;
  bottom: 10px;

  .uploader-app {
    width: 600px;
  }
  .el-empty {
    padding: 20px 0;
  }
  .file-panel {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2);

    .file-title {
      display: flex;
      height: 50px;
      line-height: 50px;
      padding: 0 15px;
      border-bottom: 1px solid #dcdfe6;

      .operate {
        flex: 1;
        text-align: right;
        .el-icon-close {
          font-size: 16px;
          cursor: pointer;
        }
      }
    }
    .file-list {
      position: relative;
      height: 240px;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: #fff;
      font-size: 14px;

      > li {
        background-color: #fff;
      }
      >>> .uploader-file {
        border-bottom: 1px solid #dcdfe6;
        .uploader-file-info {
          padding: 0 10px;
        }
      }
    }
  }
  >>> .uploader-file-icon {
    &:before {
      content: '' !important;
    }
  }

  >>> .uploader-file-actions > span {
    margin-right: 6px;
  }
}

/* 隐藏上传按钮 */
#file-uploader-btn {
  position: absolute;
  clip: rect(0, 0, 0, 0);
}
</style>