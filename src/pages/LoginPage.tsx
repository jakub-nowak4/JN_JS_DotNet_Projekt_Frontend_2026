import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { Alert } from '../components/Alert.tsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (submitError: any) {
      setError(submitError.message || 'Błąd połączenia z serwerem.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page animate-fade">
      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title" style={{ color: 'var(--text-primary)' }}>MedicalClinic</h1>
        <p className="login-subtitle" style={{ color: 'var(--text-secondary)' }}>
          Wprowadź swoje dane, aby uzyskać dostęp do panelu medycznego.
        </p>

        <Alert message={error} type="error" onClose={() => setError(null)} />

        <form className="login-form" onSubmit={handleSubmit}>
          <label style={{ color: 'var(--text-primary)' }}>
            Adres E-mail
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="np. lekarz@medicalclinic.pl"
              required
              disabled={isSubmitting}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Hasło
            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </label>

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent' }}></span>
                Logowanie...
              </span>
            ) : (
              'Zaloguj się'
            )}
          </button>
        </form>

        <p className="login-footer" style={{ color: 'var(--text-secondary)' }}>
          Nie posiadasz jeszcze konta?{' '}
          <Link to="/register" style={{ color: 'var(--primary)' }}>Utwórz konto personelu</Link>
        </p>
      </section>
    </main>
  )
}
