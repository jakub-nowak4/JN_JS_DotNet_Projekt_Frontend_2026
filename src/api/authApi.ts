import { api } from './api.ts'

export type LoginRequest = {
  email: string
  password: string
  rememberMe: boolean
}

export type LoginResult = {
  succeeded: boolean
  statusCode: number
  message: string
  userId?: string
  email?: string
  roles?: string[]
}

export type RegisterRequest = {
  email: string
  firstName: string
  lastName: string
  password: string
  role: string
}

export type RegisterResult = {
  succeeded: boolean
  statusCode: number
  message: string
  userId?: string
  errors?: string[]
}

export async function login(request: LoginRequest): Promise<LoginResult> {
  try {
    const data = await api.auth.login({
      email: request.email,
      password: request.password,
    })
    return {
      succeeded: true,
      statusCode: 200,
      message: 'Zalogowano pomyślnie',
      email: request.email,
      roles: [data.role],
    }
  } catch (err: any) {
    return {
      succeeded: false,
      statusCode: 401,
      message: err.message || 'Niepoprawne dane logowania',
    }
  }
}

export async function register(request: RegisterRequest): Promise<RegisterResult> {
  try {
    const data = await api.auth.register(request)
    return {
      succeeded: true,
      statusCode: 200,
      message: data.message || 'Zarejestrowano pomyślnie',
    }
  } catch (err: any) {
    return {
      succeeded: false,
      statusCode: 400,
      message: err.message || 'Błąd rejestracji',
    }
  }
}

