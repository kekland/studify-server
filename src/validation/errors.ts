export interface IError {
  message: string,
  code: number,
}

export const Errors = {
  insufficientPermissions: {
    message: 'You do not have sufficient permissions to perform this action',
    code: 400,
  },
  invalidAuthentication: {
    message: 'You do not have valid authentication token',
    code: 400,
  },
  invalidRequest: {
    message: 'Your request was malformed or corrupted',
    code: 400,
  },
  invalidCredentials: {
    message: 'Invalid username or password',
    code: 400,
  }
}