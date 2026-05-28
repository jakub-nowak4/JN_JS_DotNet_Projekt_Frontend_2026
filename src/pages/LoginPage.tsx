import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { login } from '../api/authApi.ts'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const loginResult = await login({ email, password, rememberMe })
      if (!loginResult.succeeded) {
        setError(loginResult.message)
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Nieznany blad'
      setError(`Nie udalo sie wykonac logowania: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title">MedicalClinc</h1>
        <p className="login-subtitle">Zaloguj sie, aby wejsc do panelu systemu.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="np. kontakt@medicalclinc.pl"
              required
            />
          </label>

          <label>
            Haslo
            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Wpisz haslo"
              required
            />
          </label>

          <div className="remember-me-row">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <label htmlFor="rememberMe">Zapamietaj mnie</label>
          </div>

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Logowanie...' : 'Zaloguj sie'}
          </button>
        </form>

        {error ? <p className="response-message error">{error}</p> : null}
        <p className="login-footer">
          Nie masz konta? <Link to="/register">Stworz konto</Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
