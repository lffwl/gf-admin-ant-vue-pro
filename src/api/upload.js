import { axios } from '@/utils/request'

export function Upload (data) {
  return axios({
    url: '/upload',
    method: 'post',
    data: data
  })
}
