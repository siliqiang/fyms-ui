import request from '@/utils/request'

// 查询宠物种类列表
export function listBreed(query) {
  return request({
    url: '/system/breed/list',
    method: 'get',
    params: query
  })
}

// 查询宠物种类详细
export function getBreed(id) {
  return request({
    url: '/system/breed/' + id,
    method: 'get'
  })
}

// 新增宠物种类
export function addBreed(data) {
  return request({
    url: '/system/breed',
    method: 'post',
    data: data
  })
}

// 修改宠物种类
export function updateBreed(data) {
  return request({
    url: '/system/breed',
    method: 'put',
    data: data
  })
}

// 删除宠物种类
export function delBreed(id) {
  return request({
    url: '/system/breed/' + id,
    method: 'delete'
  })
}

// 导出宠物种类
export function exportBreed(query) {
  return request({
    url: '/system/breed/export',
    method: 'get',
    params: query
  })
}