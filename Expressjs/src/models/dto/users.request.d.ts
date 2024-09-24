export interface RegisterRequestBody {
  name: string
  email: string
  password: string
  confirmPassword: string
  dateOfBirth: string
}

export interface LoginRequestBody {
  email: string
  password: string
}

export interface LogoutRequestBody {
  refreshToken: string
}

export interface RefreshTokenRequestBody {
  refreshToken: string
}

export interface VerifyEmailRequestBody {
  emailVerifyToken: string
}

export interface ForgotPasswordRequestBody {
  email: string
}

export interface VerifyForgotPasswordTokenRequestBody {
  forgotPasswordToken: string
}

export interface ResetPasswordRequestBody {
  forgotPasswordToken: string
  password: string
  confirmPassword: string
}
