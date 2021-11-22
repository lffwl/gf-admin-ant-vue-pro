import { axios } from '@/utils/request'

export function login (data) {
  return axios({
    url: '/auth/login',
    method: 'post',
    data: data
  })
}

export function logout () {
  return axios({
    url: '/auth/logout',
    method: 'get'
  })
}

export function getInfo () {
  return axios({
    url: '/auth/info',
    method: 'get'
  })
}
