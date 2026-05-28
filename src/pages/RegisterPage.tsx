import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { register, type RegisterResult } from '../api/authApi.ts'

const AVAILABLE_ROLES = ['Admin', 'Lekarz', 'Rejestratorka']

function RegisterPage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(AVAILABLE_ROLES[2])
  const [result, setResult] = useState<RegisterResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setResult(null)
    setIsSubmitting(true)

    try {
      const registerResult = await register({ email, firstName, lastName, password, role })
      setResult(registerResult)
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Nieznany blad'
      setError(`Nie udalo sie utworzyc konta: ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="register-title">
        <h1 id="register-title">MedicalClinc</h1>
        <p className="login-subtitle">Zaloz konto i wybierz role uzytkownika w systemie.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Imie
            <input
              type="text"
              name="firstName"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="np. Jan"
              required
              maxLength={50}
            />
          </label>

          <label>
            Nazwisko
            <input
              type="text"
              name="lastName"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="np. Kowalski"
              required
              maxLength={100}
            />
          </label>

          <label>
            E-mail
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="np. kontakt@medicalclinc.pl"
              required
              maxLength={256}
            />
          </label>

          <label>
            Haslo
            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Utworz haslo"
              required
              minLength={8}
            />
          </label>

          <label>
            Rola
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              {AVAILABLE_ROLES.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleOption}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Tworzenie...' : 'Stworz konto'}
          </button>
        </form>

        {error ? <p className="response-message error">{error}</p> : null}
        {result ? (
          <div className={result.succeeded ? 'response-message success' : 'response-message error'}>
            <p>{result.message}</p>
            <p>Status: {result.statusCode}</p>
            {result.userId ? <p>UserId: {result.userId}</p> : null}
            {result.errors?.length ? <p>Errors: {result.errors.join(', ')}</p> : null}
          </div>
        ) : null}

        <p className="login-footer">
          Masz juz konto? <Link to="/login">Zaloguj sie</Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage
