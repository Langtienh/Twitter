const USERS_MESSAGE = {
  notFound: 'User not found',
  field: {
    verify: {
      locked: 'Account is blocked. Contact support.',
      unverified: 'Account is not verified. Please verify your email.'
    },
    userId: {
      require: 'UserId is require',
      invalid: 'UserId invalid'
    },
    username: {
      require: 'username is require',
      regexError:
        'Username must be 4-15 characters long, containing only letters, numbers, and underscores, and cannot consist solely of numbers.',
      isExist: 'Username is exist'
    },
    name: {
      required: 'Name is required',
      length: 'Name must be between 1 and 63 characters'
    },
    email: {
      required: 'Email is required',
      invalid: 'Invalid email format',
      alreadyExists: 'Email already exists',
      length: 'Email must be between 1 and 63 characters'
    },
    password: {
      required: 'Password is required',
      length: 'Password must be between 6 and 63 characters',
      strengthError:
        'Password must include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character.',
      confirmation: {
        required: 'Password confirmation is required',
        mismatch: 'Password confirmation does not match password'
      }
    },
    dateOfBirth: {
      required: 'Date of birth is required',
      invalid: 'Invalid date format'
    },
    bio: {
      isLength: 'Bio must be max 200 characters.'
    },
    location: {
      isLength: 'Location must be max 200 characters.'
    },
    website: {
      isLength: 'Website must be max 200 characters.'
    },
    coverPhoto: {
      isLength: 'Cover photo URL must be between 1 and 200 characters.'
    },
    avatar: {
      isLength: 'Avatar URL must be between 1 and 200 characters.'
    },
    forgotPassword: {
      require: 'Forgot password is required'
    },
    followedUserId: {
      require: 'FollowedUserId is require'
    },
    refreshToken: {
      required: 'Refresh token is required',
      invalid: 'Refresh token is invalid'
    },
    accessToken: {
      required: 'Access token is required',
      unauthorized: 'Access token is unauthorized'
    },
    verifyEmailToken: {
      required: 'Verify token is required',
      verifiedBefore: 'Email has been verified before',
      usedOrNotExist: 'Used refresh token or not exist'
    }
  },

  validation: {
    default: 'Validation error'
  },
  api: {
    register: {
      success: 'Register successfully'
    },
    login: {
      success: 'Login successfully',
      emailOrPasswordIncorrect: 'Email or password is incorrect'
    },
    logout: {
      success: 'Logout successfully'
    },
    refreshToken: { success: 'Token refreshed successfully' },
    emailVerify: { success: 'Email verified successfully' },
    resendEmailVerify: { success: 'Resent email verification successfully' },
    resetPassword: { success: 'Password reset successfully' },
    sendLinkResetPassword: {
      success: 'Password reset link sent to email successfully'
    },
    getUser: { success: 'User information retrieved successfully' },
    updateMe: { success: 'User updated successfully' },
    passwordReset: {},
    follower: {
      followed: 'Followed by before',
      success: 'Follow successfully',
      unfollowSuccess: 'Unfollow successfully',
      faild: 'Follow faild',
      cannotFollow: "Can't follow yourself"
    }
  }
} as const

export default USERS_MESSAGE
