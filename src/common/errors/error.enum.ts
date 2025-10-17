export const ERROR = {
  USER_NOT_FOUND: {
    message: 'Không tìm thấy người dùng',
    statusCode: 404,
    code: 'USER_NOT_FOUND',
  },
  INVALID_ID: {
    message: 'ID không hợp lệ',
    statusCode: 400,
    code: 'INVALID_ID',
  },
  MISSING_USER_ID: {
    message: 'Thiếu ID người dùng',
    statusCode: 400,
    code: 'MISSING_USER_ID',
  },
  USER_BLOCKED: {
    message: 'Tài khoản bị khóa',
    statusCode: 403,
    code: 'USER_BLOCKED',
  },
  INTERNAL_ERROR: {
    message: 'Lỗi không xác định',
    statusCode: 500,
    code: 'INTERNAL_ERROR',
  },
} as const;
