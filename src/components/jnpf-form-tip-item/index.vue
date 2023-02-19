<template>
  <el-form-item v-on="$listeners" v-bind="$attrs">
    <span slot="label">{{label}}
      <template v-if="tipLabel">
        <el-tooltip :content="tipLabel" placement="top">
          <a :class="tipIcon"></a>
        </el-tooltip>
      </template>
      <a v-else class="empty-icon"></a>
    </span>
    <slot />
  </el-form-item>
</template>

<script>
export default {
  name: 'jnpf-form-tip-item',
  props: {
    label: {
      type: String,
      default: ''
    },
    tipLabel: {
      type: String,
      default: ''
    },
    tipIcon: {
      type: String,
      default: 'el-icon-warning-outline'
    }
  }
}
</script>
<style lang="scss" scoped>
.empty-icon {
  display: inline-block;
  width: 14px;
}
</style>