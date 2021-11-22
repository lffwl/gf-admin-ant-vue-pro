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
        <a-form-item label="登录名">
          <a-input v-decorator="['user_name', {rules: [{required: true, message: '请输入登录名！'}]}]" />
        </a-form-item>
        <a-form-item label="真实姓名">
          <a-input v-decorator="['real_name', {rules: [{required: true, message: '请输入真实姓名！'}]}]" />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-decorator="['status', {initialValue: 1}, {rules: []}]" style="width: 100%">
            <a-radio v-for="(item,i) in adminStatus" :key="i" :value="parseInt(i)">{{ item }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="角色">
          <a-tree-select
            style="width: 100%"
            :allowClear="true"
            :treeDefaultExpandAll="true"
            :multiple="true"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :tree-data="roleMap"
            :replaceFields="{children:'children', title:'name', key:'id', value: 'id'}"
            @change="roleSelect"
            v-model="roles"
          >
          </a-tree-select>
          <a-input type="hidden" v-decorator="['roles', {rules: [{required: true, message: '请选择角色！'}]}]" />
        </a-form-item>
        <a-form-item label="密码">
          <a-input
            v-decorator="['password',{rules: [ model && model.id > 0 ? {} : {required: true, message: '请输入密码！'}]}]"
            :placeholder="model && model.id > 0 ? '留空不修改':'请输入密码'" />
        </a-form-item>
        <a-form-item label="组织架构">
          <a-tree-select
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :tree-data="groupMap"
            :replaceFields="{children:'children', title:'name', key:'id', value: 'id'}"
            @change="groupSelect"
            v-model="groupId"
            tree-default-expand-all>
          </a-tree-select>
          <a-input type="hidden" v-decorator="['group_id', {rules: [{required: true, message: '请选择组织架构！'}]}]" />
        </a-form-item>
        <a-form-item label="手机号码">
          <a-input v-decorator="['mobile', {rules: []}]" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-decorator="['email', {rules: []}]" />
        </a-form-item>
        <a-form-item label="头像">
          <a-upload
            list-type="picture-card"
            class="avatar-uploader"
            :show-upload-list="false"
            :beforeUpload="avatarBeforeUpload"
          >
            <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" style="width: 100px; height: 100px;" />
            <div v-else>
              <a-icon :type="adminAvatarLoading ? 'loading' : 'plus'" />
              <div class="ant-upload-text">
                Upload
              </div>
            </div>
          </a-upload>
          <a-input type="hidden" v-decorator="['avatar', {rules: []}]" />
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import pick from 'lodash.pick'
import { Upload } from '@/api/upload'

// 表单字段
const fields = ['user_name', 'real_name', 'status', 'roles', 'password', 'mobile', 'email', 'avatar', 'group_id', 'id']

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
      adminStatus: [],
      adminAvatarLoading: false,
      avatarUrl: '',
      roleMap: [],
      groupMap: [],
      roles: [],
      groupId: null,
      title: '新增管理员',
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
      this.title = '新增管理员'
      this.roles = []
      this.avatarUrl = ''
      this.groupId = null
      if (this.model.id) {
        this.avatarUrl = this.model.avatar
        this.groupId = this.model.group_id === 0 ? null : this.model.group_id
        this.title = '编辑管理员 - ID：' + this.model.id
        if (this.model.roles) {
          this.roles = this.model.roles.split(',')
        }
      }
      this.adminStatus = this.model.adminStatus
      this.roleMap = this.model.roleMap
      this.groupMap = this.model.groupMap
      // string
      if (this.model) {
        this.form.setFieldsValue(pick(this.model, fields))
      }
    })
  },
  methods: {
    avatarBeforeUpload (file) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'AdminAvatar')
      this.adminAvatarLoading = true
      // 文件上传
      Upload(formData).then(res => {
        if (res.code === 0) {
          this.avatarUrl = process.env.VUE_APP_API_BASE_URL + res.data.url
          this.form.setFieldsValue({ avatar: this.avatarUrl })
        } else {
          this.$message.error(res.message)
        }
        this.adminAvatarLoading = false
      }).catch(() => {
        this.adminAvatarLoading = false
        this.$message.error('文件上传失败')
      })
      return false
    },
    roleSelect (value) {
      this.roles = value
      this.form.setFieldsValue({ roles: value.toString() })
    },
    groupSelect (value) {
      this.form.setFieldsValue({ group_id: value })
    }
  }
}
</script>
