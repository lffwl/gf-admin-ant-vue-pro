<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd" v-action:Role-Store>新增</a-button>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        :defaultExpandAllRows="true"
      >
        <span slot="roleDpSlot" slot-scope="text">
          <a-tag color="blue">{{ text | keyArrayToValue(roleDps) }}</a-tag>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)" v-if="$auth('Role-Update')">编辑</a>
            <a-divider type="vertical" />
            <a @click="handleDel(record)" v-if="$auth('Role-Delete')">删除</a>
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
import { Index, Store, Update, Delete, Show } from '@/api/role'
import { Index as MenuIndex } from '@/api/menu'
import { ListToTree } from '@/utils/array'

const columns = [
  {
    title: 'ID',
    dataIndex: 'id'
  },
  {
    title: '名称',
    dataIndex: 'name'
  },
  {
    title: '数据权限',
    dataIndex: 'dp',
    scopedSlots: { customRender: 'roleDpSlot' }
  },
  {
    title: '最后更新时间',
    dataIndex: 'updated_at'
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' }
  }
]

export default {
  name: 'SystemRole',
  components: {
    STable,
    Ellipsis,
    CreateForm
  },
  data () {
    this.columns = columns
    return {
      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      roleDps: [],
      menuMap: [],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        console.log('loadData request parameters:', requestParameters)
        return Index(requestParameters)
          .then(res => {
            console.log(res)
            this.roleDps = res.data.config.dps
            if (res.data.list) {
              return res.data
            }
            return { list: [] }
          })
      }
    }
  },
  filters: {},
  created () {
    const self = this
    // 获取菜单列表
    MenuIndex().then(res => {
      self.MenuMap = ListToTree(res.data.list)
    })
  },
  computed: {},
  methods: {
    handleAdd () {
      this.mdl = { ...{ roleDps: this.roleDps, MenuMap: this.MenuMap } }
      this.visible = true
    },
    handleEdit (record) {
      // 获取详情数据
      Show(record.id).then(res => {
        if (res.code === 0) {
          res.data.menus = res.data.menus.toString()
          this.mdl = { ...res.data }
          this.mdl.roleDps = this.roleDps
          this.mdl.MenuMap = this.MenuMap
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
