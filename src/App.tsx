import { useEffect, useRef, useState } from 'react'
import './App.css'

function App() {
  const [view, setView] = useState<'register' | 'login'>('login')
  const [roleOpen, setRoleOpen] = useState(false)
  const [role, setRole] = useState('Rejestratorka')
  const roleSelectRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!roleSelectRef.current?.contains(event.target as Node)) {
        setRoleOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentClick)

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick)
    }
  }, [])

  const chooseRole = (nextRole: string) => {
    setRole(nextRole)
    setRoleOpen(false)
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        {view === 'register' ? (
          <>
            <h1 id="login-title">MedicalClinc</h1>
            <p className="login-subtitle">Załóż konto i wybierz rolę użytkownika w systemie.</p>

            <form className="login-form">
              <label>
                Imię i nazwisko
                <input type="text" name="fullName" placeholder="np. Jan Kowalski" />
              </label>

              <label>
                E-mail
                <input type="email" name="email" placeholder="np. kontakt@medicalclinc.pl" />
              </label>

              <label>
                Hasło
                <input type="password" name="password" placeholder="Utwórz hasło" />
              </label>

              <div className="role-field">
                <span>Rola</span>
                <div className="select-shell" ref={roleSelectRef}>
                  <button
                    type="button"
                    className="select-trigger"
                    onClick={() => setRoleOpen((value) => !value)}
                    aria-expanded={roleOpen}
                    aria-haspopup="listbox"
                  >
                    <span>{role}</span>
                    <span className={roleOpen ? 'select-arrow open' : 'select-arrow'} />
                  </button>

                  {roleOpen ? (
                    <div className="select-menu" role="listbox" aria-label="Wybór roli">
                      <button
                        type="button"
                        className={role === 'Admin' ? 'select-option active' : 'select-option'}
                        onMouseDown={() => chooseRole('Admin')}
                      >
                        Admin
                      </button>
                      <button
                        type="button"
                        className={role === 'Lekarz' ? 'select-option active' : 'select-option'}
                        onMouseDown={() => chooseRole('Lekarz')}
                      >
                        Lekarz
                      </button>
                      <button
                        type="button"
                        className={
                          role === 'Rejestratorka' ? 'select-option active' : 'select-option'
                        }
                        onMouseDown={() => chooseRole('Rejestratorka')}
                      >
                        Rejestratorka
                      </button>
                    </div>
                  ) : null}
                  <input type="hidden" name="role" value={role} />
                </div>
              </div>

              <button type="button" className="login-button">
                Stwórz konto
              </button>

              <p className="login-footer">
                Masz już konto?{' '}
                <button type="button" className="text-link" onClick={() => setView('login')}>
                  Zaloguj się
                </button>
              </p>
            </form>
          </>
        ) : (
          <>
            <h1 id="login-title">MedicalClinc</h1>
            <p className="login-subtitle">Zaloguj się, aby wejść do panelu systemu.</p>

            <form className="login-form">
              <label>
                E-mail
                <input type="email" name="email" placeholder="np. kontakt@medicalclinc.pl" />
              </label>

              <label>
                Hasło
                <input type="password" name="password" placeholder="Wpisz hasło" />
              </label>

              <button type="button" className="login-button">
                Zaloguj się
              </button>

              <p className="login-footer">
                Nie masz konta?{' '}
                <button type="button" className="text-link" onClick={() => setView('register')}>
                  Stwórz konto
                </button>
              </p>
            </form>
          </>
        )}
      </section>
    </main>
  )
}

export default App
