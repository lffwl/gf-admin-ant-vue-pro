import { axios } from '@/utils/request'

export function Index (parameters) {
  return axios({
    url: '/admin',
    method: 'get',
    params: parameters
  })
}

export function Store (data) {
  return axios({
    url: '/admin',
    method: 'post',
    data: data
  })
}

export function Update (data) {
  return axios({
    url: '/admin/' + data.id,
    method: 'put',
    data: data
  })
}

export function Delete (id) {
  return axios({
    url: '/admin/' + id,
    method: 'delete'
  })
}

export function Show (id) {
  return axios({
    url: '/admin/' + id,
    method: 'get'
  })
}
