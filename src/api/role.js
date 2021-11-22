import { axios } from '@/utils/request'

export function Index (parameters) {
  return axios({
    url: '/role',
    method: 'get',
    params: parameters
  })
}

export function Store (data) {
  return axios({
    url: '/role',
    method: 'post',
    data: data
  })
}

export function Update (data) {
  return axios({
    url: '/role/' + data.id,
    method: 'put',
    data: data
  })
}

export function Delete (id) {
  return axios({
    url: '/role/' + id,
    method: 'delete'
  })
}

export function Show (id) {
  return axios({
    url: '/role/' + id,
    method: 'get'
  })
}
