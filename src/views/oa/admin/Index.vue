<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="真实姓名">
                <a-input v-model="queryParam.real_name" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <a-form-item label="手机号码">
                <a-input v-model="queryParam.mobile" placeholder="" />
              </a-form-item>
            </a-col>
            <a-col :md="8" :sm="24">
              <span class="table-page-search-submitButtons">
                <a-button type="primary" @click="$refs.table.refresh(true)">查询</a-button>
                <a-button style="margin-left: 8px" @click="() => this.queryParam = {}">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd" v-action:Admin-Store>新增</a-button>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        :defaultExpandAllRows="true"
        :expandedRowKeys="selectRowKeys"
      >
        <span slot="adminGroupSlot" slot-scope="text"><a-tag color="blue">
          {{ text | keyArrayToValue(groupKvMap) }}</a-tag>
        </span>
        <span slot="adminStatusSlot" slot-scope="text">
          <a-badge :status="text ? 'success' : 'error'" :text="text | keyArrayToValue(adminStatus)" />
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)" v-if="$auth('Admin-Update')">编辑</a>
            <a-divider type="vertical" />
            <a @click="handleDel(record)" v-if="$auth('Admin-Delete')">删除</a>
          </template>
        </span>
      </s-table>

      <create-form
        ref="createModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { STable, Ellipsis } from '@/components'

import CreateForm from './modules/SaveForm'
import { Index, Store, Update, Delete, Show } from '@/api/admin'
import { ListToTree, MapKeyToValue } from '@/utils/array'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id'
  },
  {
    title: '登录名',
    dataIndex: 'user_name'
  },
  {
    title: '真实姓名',
    dataIndex: 'real_name'
  },
  {
    title: '组织架构',
    dataIndex: 'group_id',
    scopedSlots: { customRender: 'adminGroupSlot' }
  },
  {
    title: '状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'adminStatusSlot' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'SystemAdmin',
  components: {
    STable,
    Ellipsis,
    CreateForm
  },
  data () {
    this.columns = columns
    return {
      // 查询参数
      queryParam: {},
      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      selectRowKeys: [],
      adminStatus: [],
      roleMap: [],
      groupMap: [],
      groupKvMap: [],
      roleKvMap: [],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        console.log('loadData request parameters:', requestParameters)
        return Index(requestParameters)
          .then(res => {
            console.log(res)
            this.adminStatus = res.data.config.admin_status
            this.roleMap = res.data.roles
            this.roleKvMap = MapKeyToValue(res.data.roles)
            this.groupMap = ListToTree(res.data.groups)
            this.groupKvMap = MapKeyToValue(res.data.groups)
            if (!res.data.list) {
              res.data.list = []
            }
            return res.data
          })
      }
    }
  },
  filters: {},
  created () {
  },
  computed: {},
  methods: {
    handleAdd () {
      this.mdl = { ...{ adminStatus: this.adminStatus, roleMap: this.roleMap, groupMap: this.groupMap } }
      this.visible = true
    },
    handleEdit (record) {
      // 获取详情数据
      Show(record.id).then(res => {
        if (res.code === 0) {
          res.data.roles = res.data.roles.toString()
          this.mdl = { ...res.data }
          this.mdl.adminStatus = this.adminStatus
          this.mdl.roleMap = this.roleMap
          this.mdl.groupMap = this.groupMap
          this.visible = true
        } else {
          this.$message.error(res.message)
        }
      }).catch(() => {
        this.$message.error('获取详情失败')
      })
    },
    handleOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          if (values.id > 0) {
            Update(values).then(res => {
              if (res.code === 0) {
                this.handleCancel()
                // 刷新表格
                this.$refs.table.refresh()
                this.$message.success(res.message)
              } else {
                this.confirmLoading = false
                this.$message.error(res.message)
              }
            })
          } else {
            // 新增
            Store(values).then(res => {
              if (res.code === 0) {
                this.handleCancel()
                // 刷新表格
                this.$refs.table.refresh()
                this.$message.success(res.message)
              } else {
                this.confirmLoading = false
                this.$message.error(res.message)
              }
            })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel () {
      this.visible = false
      this.confirmLoading = false
      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleDel (record) {
      const self = this
      this.$confirm({
        title: '删除',
        content: '是否删除行：ID（' + record.id + '）',
        onOk () {
          return Delete(record.id).then(res => {
            if (res.code === 0) {
              // 刷新表格
              self.$refs.table.refresh()
              self.$message.success(res.message)
            } else {
              self.$message.error(res.message)
            }
          })
        }
      })
    }
  }
}
</script>
