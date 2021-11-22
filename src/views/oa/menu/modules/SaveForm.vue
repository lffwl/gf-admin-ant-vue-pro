<template>
  <a-modal
    :title="title"
    :width="640"
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
        <a-form-item label="菜单名称">
          <a-input v-decorator="['name', {rules: [{required: true, message: '请输入菜单名称！'}]}]" />
        </a-form-item>
        <a-form-item label="上级菜单">
          <a-tree-select
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :tree-data="listMap"
            :replaceFields="{children:'children', title:'name', key:'id', value: 'id'}"
            @change="pidSelect"
            v-model="pid"
            tree-default-expand-all>
          </a-tree-select>
          <a-input name="pid" type="hidden" v-decorator="['pid', {rules: []}]" />
        </a-form-item>
        <a-form-item label="标识">
          <a-input v-decorator="['key', {rules: [{required: true, message: '请输入标识！'}]}]" />
        </a-form-item>
        <a-form-item label="菜单类型">
          <a-radio-group v-decorator="['type', {rules: [{required: true, message: '请选择菜单类型！'}]}]" style="width: 100%">
            <a-radio v-for="(item,i) in menuType" :key="i" :value="parseInt(i)">{{ item }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="请求地址">
          <a-input v-decorator="['router', {rules: []}]" />
        </a-form-item>
        <a-form-item label="请求类型">
          <a-radio-group v-decorator="['method', {initialValue: 0}, {rules: []}]" style="width: 100%">
            <a-radio v-for="(item,i) in menuMethod" :key="i" :value="parseInt(i)">{{ item }}</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'

// 表单字段
const fields = ['name', 'pid', 'key', 'type', 'router', 'method', 'id']

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
      listMap: [],
      menuType: [],
      menuMethod: [],
      pid: null,
      title: '新增菜单',
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
      this.title = '新增菜单'
      this.pid = null
      if (this.model.id) {
        this.title = '编辑菜单 - ID：' + this.model.id
        this.pid = this.model.pid
      }
      this.listMap = this.model.listMap.concat({ id: 0, name: '最上级' })
      this.menuType = this.model.menuType
      this.menuMethod = this.model.menuMethod
      // string
      if (this.model) {
        this.form.setFieldsValue(pick(this.model, fields))
      }
    })
  },
  methods: {
    pidSelect (value) {
      this.form.setFieldsValue({ pid: value })
    }
  }
}
</script>
