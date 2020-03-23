export interface IError {
  message: string,
  code: number,
}

export const Errors = {
  insufficientPermissions: {
    message: 'You do not have sufficient permissions to perform this action',
    errorCode: 400,
  },
  invalidAuthentication: {
    message: 'You do not have valid authentication token',
    errorCode: 400,
  },
  invalidRequest: {
    message: 'Your request was malformed or corrupted',
    errorCode: 400,
  },
  invalidCredentials: {
    message: 'Invalid username or password',
    errorCode: 400,
  },
  userExists: {
    message: 'User with this username or email already exists',
    errorCode: 400,
  },
  internalServerError: {
    message: 'Internal server error occurred',
    errorCode: 500,
  },
}