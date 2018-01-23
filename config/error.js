const name = {
  UNKNOW_ERROR: 'UNKNOW_ERROR',
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_FIELD: 'INVALID_FIELD',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  NOT_EXIST: 'NOT_EXIST',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
}

const detail = new Map()

detail.set(name.UNKNOW_ERROR, { code: 40000, message: '未知错误' })
detail.set(name.MISSING_FIELD, { code: 42000, message: '参数不完整' })
detail.set(name.INVALID_FIELD, { code: 44000, message: '参数不合法' })
detail.set(name.ALREADY_EXISTS, { code: 46000, message: '对象已存在' })
detail.set(name.NOT_EXIST, { code: 48000, message: '对象不存在' })
detail.set(name.INTERNAL_SERVER_ERROR, { code: 50000, message: '服务器内部错误' })

module.exports = {
  name: name,
  detail: detail
}
