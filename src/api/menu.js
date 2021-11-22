import { axios } from '@/utils/request'

export function Index () {
  return axios({
    url: '/menu',
    method: 'get'
  })
}

export function Store (data) {
  return axios({
    url: '/menu',
    method: 'post',
    data: data
  })
}

export function Update (data) {
  return axios({
    url: '/menu/' + data.id,
    method: 'put',
    data: data
  })
}

export function Delete (id) {
  return axios({
    url: '/menu/' + id,
    method: 'delete'
  })
}
