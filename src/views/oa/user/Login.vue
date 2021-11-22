<template>
  <div class="main">
    <a-form
      id="formLogin"
      class="user-layout-login"
      ref="formLogin"
      :form="form"
    >
      <a-form-item>
        <a-input
          placeholder="请输入登录名"
          v-decorator="['user_name', {rules: [{required: true, message: '请输入登录名！'}]}]"
          style="height:40px">
          <a-icon slot="large" type="user" style="color: rgba(0,0,0,.25);" />
        </a-input>
      </a-form-item>

      <a-form-item>
        <a-input-password
          size="large"
          placeholder="请输入密码"
          v-decorator="['password',{rules: [{ required: true, message:'请输入密码' }]}]"
        >
          <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }" />
        </a-input-password>
      </a-form-item>

      <a-form-item style="margin-top:24px">
        <a-button
          size="large"
          type="primary"
          class="login-button"
          @click="handleSubmit"
        >登录
        </a-button>
      </a-form-item>

    </a-form>
  </div>
</template>

<script>
import { timeFix } from '@/utils/util'
import { mapActions } from 'vuex'

export default {
  components: {},
  data () {
    return {
      form: this.$form.createForm(this)
    }
  },
  created () {
  },
  methods: {
    ...mapActions(['Login', 'Logout']),
    handleSubmit () {
      const {
        Login
      } = this
      this.form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          Login(values)
            .then((res) => this.loginSuccess(res))
            .catch(err => this.requestFailed(err))
        }
      })
    },
    loginSuccess (res) {
      console.log(res)
      this.$router.push({ path: '/' })
      // 延迟 1 秒显示欢迎信息
      setTimeout(() => {
        this.$notification.success({
          message: '欢迎',
          description: `${timeFix()}，欢迎回来`
        })
      }, 1000)
      this.isLoginError = false
    },
    requestFailed (err) {
      this.isLoginError = true
      this.$notification['error']({
        message: '错误',
        description: err.message || '请求出现错误，请稍后再试',
        duration: 4
      })
    }
  }
}
</script>

<style lang="less" scoped>

.user-layout-login {

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }

}
</style>
