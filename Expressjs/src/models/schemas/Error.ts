import httpStatus from '@/constants/http.status'

export class ErrorWithMessage {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

type TError = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

export class EntityError extends ErrorWithMessage {
  errors: TError
  constructor({ message, errors }: { message: string; errors: TError }) {
    super({ message: message, status: httpStatus.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
