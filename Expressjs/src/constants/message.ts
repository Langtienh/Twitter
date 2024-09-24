export const USERS_MESSAGE = {
  VALIDATION_ERROR: 'Validation error',
  // register
  USER_NOT_FOUND: 'User not found',
  NAME_REQUIRED: 'Name is required',
  NAME_LENGTH: 'Name must be between 1 and 63 characters',
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Invalid email format',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_LENGTH: 'Password must be between 6 and 63 characters',
  PASSWORD_STRENGTH_ERROR:
    'The password must be at least 6 characters long, including at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character.',
  CONFIRM_PASSWORD_REQUIRED: 'Password confirmation is required',
  PASSWORD_CONFIRMATION_MISMATCH:
    'Password confirmation does not match password',
  DATE_OF_BIRTH_REQUIRED: 'Date of birth is required',
  DATE_OF_BIRTH_INVALID: 'Invalid date format',
  // login
  LOGIN_SUCCESS: 'Login successfully',
  LOGOUT_SUCCESS: 'Logout successfully',
  REGISTER_SUCCESS: 'Register successfully',
  EMAIL_OR_PASSWORD_INCORRECTLY: 'Accounts or passwords incorrectly',
  REFRESH_TOKEN_REQUIED: 'RefreshToken is required',
  REFRESH_TOKEN_INVALID: 'RefreshToken Invalid',
  ACCESS_TOKEN_REQUIED: 'Access is required',
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist',
  ACCESS_TOKEN_UNAUTHORIZED: 'Accsess token unauthoried',
  VERIFY_EMAIL_TOKEN_REQUIED: 'Verify token is required',
  EMAIL_VERIFiED_BEFORE: 'Email verified before',
  EMAIL_VERIFY_SUCCESS: 'Verify email successfully',
  RESEND_EMAIL_VERIFY_SUCCESS: 'Resend Verify email successfully',
  SEND_LINK_RESET_PASSWORD_SUCCESS:
    'Send the password recovery path to email successfully',
  FORGOT_PASSWORD_EXIST: 'Forgot password is exist',
  FORGOT_PASSWORD_REQUIRED: 'Forgot password is required',
  RESET_PASSWORD_SUCCESS: 'Reset password successfully',
  GET_USER_SUCCESS: 'Get user successfully'
} as const
