import { axios } from '@/utils/request'

export function Index () {
  return axios({
    url: '/group',
    method: 'get'
  })
}

export function Store (data) {
  return axios({
    url: '/group',
    method: 'post',
    data: data
  })
}

export function Update (data) {
  return axios({
    url: '/group/' + data.id,
    method: 'put',
    data: data
  })
}

export function Delete (id) {
  return axios({
    url: '/group/' + id,
    method: 'delete'
  })
}
