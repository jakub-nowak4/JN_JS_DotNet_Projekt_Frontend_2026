import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { Alert } from '../components/Alert.tsx'

const AVAILABLE_ROLES = ['Admin', 'Lekarz', 'Rejestratorka']

export default function RegisterPage() {
  const { register } = useAuth()
  
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(AVAILABLE_ROLES[2])
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      await register({ email, firstName, lastName, password, role })
      setSuccess('Konto personelu zostało pomyślnie zgłoszone. Oczekuj na zatwierdzenie przez Administratora.')
      
      // Clear form on success
      setEmail('')
      setFirstName('')
      setLastName('')
      setPassword('')
    } catch (submitError: any) {
      setError(submitError.message || 'Nie udało się zarejestrować konta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page animate-fade">
      <section className="login-card" aria-labelledby="register-title">
        <h1 id="register-title" style={{ color: 'var(--text-primary)' }}>MedicalClinic</h1>
        <p className="login-subtitle" style={{ color: 'var(--text-secondary)' }}>
          Wypełnij poniższy formularz, aby złożyć wniosek o rejestrację w systemie.
        </p>

        <Alert message={error} type="error" onClose={() => setError(null)} />
        <Alert message={success} type="success" onClose={() => setSuccess(null)} autoCloseMs={8000} />

        <form className="login-form" onSubmit={handleSubmit}>
          <label style={{ color: 'var(--text-primary)' }}>
            Imię
            <input
              type="text"
              name="firstName"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="np. Marek"
              required
              maxLength={50}
              disabled={isSubmitting}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Nazwisko
            <input
              type="text"
              name="lastName"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="np. Nowak"
              required
              maxLength={100}
              disabled={isSubmitting}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Adres E-mail
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="np. marek.nowak@medicalclinic.pl"
              required
              maxLength={256}
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
              placeholder="Min. 8 znaków"
              required
              minLength={8}
              disabled={isSubmitting}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Wybierz rolę
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              disabled={isSubmitting}
              className="modal-select"
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '14px',
                border: '1px solid var(--surface-border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                padding: '0 15px'
              }}
            >
              {AVAILABLE_ROLES.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption === 'Admin' ? 'Administrator' :
                   roleOption === 'Lekarz' ? 'Lekarz medycyny' : 'Rejestratorka medyczna'}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="login-button" style={{ marginTop: '10px' }} disabled={isSubmitting}>
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTopColor: 'transparent' }}></span>
                Zapisywanie...
              </span>
            ) : (
              'Wyślij wniosek'
            )}
          </button>
        </form>

        <p className="login-footer" style={{ color: 'var(--text-secondary)' }}>
          Posiadasz już aktywne konto?{' '}
          <Link to="/login" style={{ color: 'var(--primary)' }}>Zaloguj się</Link>
        </p>
      </section>
    </main>
  )
}
