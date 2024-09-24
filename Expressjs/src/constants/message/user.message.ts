const USERS_MESSAGE = {
  // Account status errors
  account: {
    locked: 'Account is blocked. Contact support.', // Tài khoản bị khoá
    unverified: 'Account is not verified. Please verify your email.', // Tài khoản chưa xác thực
    notFound: 'User not found' // Người dùng không tồn tại
  },

  // Token and authentication errors
  token: {
    usedOrNotExist: 'Used refresh token or not exist', // Token refresh đã được sử dụng hoặc không tồn tại
    emailOrPasswordIncorrect: 'Email or password is incorrect', // Sai email hoặc mật khẩu
    refreshToken: {
      required: 'Refresh token is required', // Token refresh cần thiết
      invalid: 'Refresh token is invalid' // Token refresh không hợp lệ
    },
    accessToken: {
      required: 'Access token is required', // Token truy cập cần thiết
      unauthorized: 'Access token is unauthorized' // Token truy cập không hợp lệ
    },
    verifyEmailToken: {
      required: 'Verify token is required', // Cần token xác thực email
      verifiedBefore: 'Email has been verified before' // Email đã được xác thực trước đó
    }
  },

  // Validation errors
  validation: {
    default: 'Validation error',
    name: {
      required: 'Name is required', // Tên bắt buộc
      length: 'Name must be between 1 and 63 characters' // Tên phải có từ 1 đến 63 ký tự
    },
    email: {
      required: 'Email is required', // Email bắt buộc
      invalid: 'Invalid email format', // Email không hợp lệ
      alreadyExists: 'Email already exists', // Email đã tồn tại
      length: 'Email must be between 1 and 63 characters' // Tên phải có từ 1 đến 63 ký tự
    },
    password: {
      required: 'Password is required', // Mật khẩu bắt buộc
      length: 'Password must be between 6 and 63 characters', // Mật khẩu phải có từ 6 đến 63 ký tự
      strengthError:
        'Password must include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character.', // Mật khẩu phải mạnh
      confirmation: {
        required: 'Password confirmation is required', // Xác nhận mật khẩu là bắt buộc
        mismatch: 'Password confirmation does not match password' // Xác nhận mật khẩu không trùng khớp
      }
    },
    dateOfBirth: {
      required: 'Date of birth is required', // Ngày sinh bắt buộc
      invalid: 'Invalid date format' // Định dạng ngày sinh không hợp lệ
    }, // Field validation messages
    bio: {
      isLength: 'Bio must be max 200 characters.' // Độ dài phần tiểu sử từ 1 đến 200 ký tự
    },
    location: {
      isLength: 'Location must be max 200 characters.' // Độ dài địa điểm từ 1 đến 200 ký tự
    },
    website: {
      isLength: 'Website must be max 200 characters.' // Độ dài website từ 1 đến 200 ký tự
    },
    username: {
      isLength: 'Username must be between 1 and 50 characters.' // Tên người dùng phải từ 1 đến 50 ký tự
    },
    coverPhoto: {
      isLength: 'Cover photo URL must be between 1 and 200 characters.' // URL ảnh bìa phải từ 1 đến 200 ký tự
    },
    avatar: {
      isLength: 'Avatar URL must be between 1 and 200 characters.' // URL ảnh đại diện phải từ 1 đến 200 ký tự
    }
  },

  // Success messages
  success: {
    login: 'Login successfully', // Đăng nhập thành công
    logout: 'Logout successfully', // Đăng xuất thành công
    refreshToken: 'Token refreshed successfully', // Làm mới token thành công
    register: 'Register successfully', // Đăng ký thành công
    emailVerify: 'Email verified successfully', // Xác thực email thành công
    resendEmailVerify: 'Resent email verification successfully', // Gửi lại email xác thực thành công
    resetPassword: 'Password reset successfully', // Đặt lại mật khẩu thành công
    sendLinkResetPassword: 'Password reset link sent to email successfully', // Đã gửi đường dẫn khôi phục mật khẩu đến email
    getUser: 'User information retrieved successfully', // Lấy thông tin người dùng thành công
    updateMe: 'User updated successfully'
  },

  // Password reset errors
  passwordReset: {
    forgotPasswordExist: 'Forgot password request already exists', // Yêu cầu quên mật khẩu đã tồn tại
    forgotPasswordRequired: 'Forgot password is required' // Quên mật khẩu là bắt buộc
  }
} as const

export default USERS_MESSAGE
