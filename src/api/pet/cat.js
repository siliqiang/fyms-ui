import request from '@/utils/request'

// 查询猫咪管理列表
export function listCat(query) {
  return request({
    url: '/system/cat/list',
    method: 'get',
    params: query
  })
}

// 查询种类列表
export function listBreedAll() {
  return request({
    url: '/system/breed/list/all',
    method: 'get'
  })
}

// 查询猫咪管理详细
export function getCat(id) {
  return request({
    url: '/system/cat/' + id,
    method: 'get'
  })
}

// 新增猫咪管理
export function addCat(data) {
  return request({
    url: '/system/cat',
    method: 'post',
    data: data
  })
}

// 修改猫咪管理
export function updateCat(data) {
  return request({
    url: '/system/cat',
    method: 'put',
    data: data
  })
}

// 删除猫咪管理
export function delCat(id) {
  return request({
    url: '/system/cat/' + id,
    method: 'delete'
  })
}

// 导出猫咪管理
export function exportCat(query) {
  return request({
    url: '/system/cat/export',
    method: 'get',
    params: query
  })
}
