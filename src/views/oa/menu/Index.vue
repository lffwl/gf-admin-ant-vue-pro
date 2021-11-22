<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-operator">
        <a-button type="primary" icon="plus" @click="handleAdd" v-action:Menu-Store>新增</a-button>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="id"
        :columns="columns"
        :data="loadData"
        :showPagination="false"
        :defaultExpandAllRows="true"
        :expandedRowKeys="selectRowKeys"
        @expand="onExpand"
      >
        <span slot="menuTypeSlot" slot-scope="text"><a-tag color="blue">
          {{ text | keyArrayToValue(menuType) }}</a-tag>
        </span>
        <span slot="menuMethodSlot" slot-scope="text"><a-tag color="blue" v-if="text">
          {{ text | keyArrayToValue(menuMethod) }}</a-tag>
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)" v-if="$auth('Menu-Update')">编辑</a>
            <a-divider type="vertical" />
            <a @click="handleDel(record)" v-if="$auth('Menu-Delete')">删除</a>
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
import { Index, Store, Update, Delete } from '@/api/menu'
import { GetIds, ListToTree } from '@/utils/array'

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
    title: '菜单类型',
    dataIndex: 'type',
    scopedSlots: { customRender: 'menuTypeSlot' }
  },
  {
    title: '标识',
    dataIndex: 'key'
  },
  {
    title: '请求地址',
    dataIndex: 'router'
  },
  {
    title: '请求类型',
    dataIndex: 'method',
    scopedSlots: { customRender: 'menuMethodSlot' }
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
  name: 'SystemMenu',
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
      listMap: [],
      selectRowKeys: [],
      menuType: [],
      menuMethod: [],
      // 加载数据方法 必须为 Promise 对象
      loadData: parameter => {
        const requestParameters = Object.assign({}, parameter, this.queryParam)
        console.log('loadData request parameters:', requestParameters)
        return Index()
          .then(res => {
            this.selectRowKeys = GetIds(res.data.list)
            var newData = {
              list: ListToTree(res.data.list)
            }
            console.log(newData)
            this.menuType = res.data.config.menu_types
            this.menuMethod = res.data.config.menu_methods
            this.listMap = newData.list
            return newData
          })
      }
    }
  },
  filters: {},
  created () {
  },
  computed: {},
  methods: {
    onExpand (expanded, record) {
      if (expanded) {
        // 设置展开窗Key，代表展开操作
        this.selectRowKeys.push(record.id)
      } else {
        // 代表折叠操作
        if (this.selectRowKeys.length) {
          this.selectRowKeys = this.selectRowKeys.filter(v => {
            return v !== record.id
          })
        }
      }
    },
    handleAdd () {
      this.mdl = { ...{ listMap: this.listMap, menuType: this.menuType, menuMethod: this.menuMethod } }
      this.visible = true
    },
    handleEdit (record) {
      this.visible = true
      this.mdl = { ...record }
      this.mdl.listMap = this.listMap
      this.mdl.menuType = this.menuType
      this.mdl.menuMethod = this.menuMethod
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
