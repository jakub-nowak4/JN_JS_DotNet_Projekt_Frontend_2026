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

async function postJson<TResponse, TRequest>(url: string, body: TRequest): Promise<TResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = (await response.json()) as TResponse
  return data
}

export function login(request: LoginRequest) {
  return postJson<LoginResult, LoginRequest>('/api/auth/login', request)
}

export function register(request: RegisterRequest) {
  return postJson<RegisterResult, RegisterRequest>('/api/auth/register', request)
}
