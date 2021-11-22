<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="loading"
    :maskClosable="false"
    @ok="() => { $emit('ok') }"
    @cancel="() => { $emit('cancel') }"
  >
    <a-spin :spinning="loading">
      <a-form :form="form" v-bind="formLayout">
        <!-- 检查是否有 id 并且大于0，大于0是修改。其他是新增，新增不显示主键ID -->
        <a-form-item v-show="model && model.id > 0" label="ID">
          <a-input v-decorator="['id', { initialValue: 0 }]" disabled />
        </a-form-item>
        <a-form-item label="角色名称">
          <a-input v-decorator="['name', {rules: [{required: true, message: '请输入角色名称！'}]}]" />
        </a-form-item>
        <a-form-item label="权限设置">
          <a-tree-select
            style="width: 100%"
            :allowClear="true"
            :treeDefaultExpandAll="true"
            :multiple="true"
            v-model="menus"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :tree-data="MenuMap"
            :replaceFields="{children:'children', title:'name', key:'id', value: 'id'}"
            @change="menuSelect"
          >
          </a-tree-select>
          <a-input name="menus" type="hidden" v-decorator="['menus', {rules: []}]" />
        </a-form-item>
        <a-form-item label="数据权限">
          <a-radio-group
            v-decorator="['dp', {initialValue: 0}, {rules: [{required: true, message: '请选择数据权限！'}]}]"
            style="width: 100%">
            <a-radio v-for="(item,i) in roleDps" :key="i" :value="parseInt(i)">{{ item }}</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['name', 'dp', 'menus', 'id']

export default {
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: () => false
    },
    model: {
      type: Object,
      default: () => null
    }
  },
  data () {
    this.formLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 13 }
      }
    }
    return {
      roleDps: [],
      MenuMap: [],
      menus: [],
      title: '新增角色',
      form: this.$form.createForm(this)
    }
  },
  created () {
    console.log('custom modal created')

    // 防止表单未注册
    fields.forEach(v => this.form.getFieldDecorator(v))

    // 当 model 发生改变时，为表单设置值
    this.$watch('model', () => {
      console.log(this.model)
      this.title = '新增角色'
      this.menus = []
      if (this.model.id) {
        this.title = '编辑角色 - ID：' + this.model.id
        if (this.model.menus) {
          this.menus = this.model.menus.split(',')
        }
      }
      this.roleDps = this.model.roleDps
      this.MenuMap = this.model.MenuMap
      // string
      if (this.model) {
        this.form.setFieldsValue(pick(this.model, fields))
      }
    })
  },
  methods: {
    menuSelect (value) {
      console.log(value)
      this.menus = value
      this.form.setFieldsValue({ menus: value.toString() })
    }
  }
}
</script>
