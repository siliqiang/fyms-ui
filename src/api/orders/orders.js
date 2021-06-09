import request from '@/utils/request'

// 查询订单列表
export function listOrders(query) {
  return request({
    url: '/system/orders/list',
    method: 'get',
    params: query
  })
}
// 查询用户列表
export function listUserSelect() {
  return request({
    url: '/system/client/list/select',
    method: 'get',
  })
}
// 查询物品列表
export function listGoods(query) {
  return request({
    url: '/system/goods/list/select',
    method: 'get',
    params: query
  })
}
// 查询猫咪管理列表
export function listCat(query) {
  return request({
    url: '/system/cat/list/select',
    method: 'get',
    params: query
  })
}


// 查询订单详细
export function getOrders(id) {
  return request({
    url: '/system/orders/' + id,
    method: 'get'
  })
}

// 新增订单
export function addOrders(data) {
  return request({
    url: '/system/orders',
    method: 'post',
    data: data
  })
}

// 修改订单
export function updateOrders(data) {
  return request({
    url: '/system/orders',
    method: 'put',
    data: data
  })
}

// 删除订单
export function delOrders(id) {
  return request({
    url: '/system/orders/' + id,
    method: 'delete'
  })
}

// 导出订单
export function exportOrders(query) {
  return request({
    url: '/system/orders/export',
    method: 'get',
    params: query
  })
}
