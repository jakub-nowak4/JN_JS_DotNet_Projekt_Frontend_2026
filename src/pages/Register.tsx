import { useRef, useState, useEffect } from 'react'
import '/src/App.css';

export default function Register() {
  const [roleOpen, setRoleOpen] = useState(false)
  const [role, setRole] = useState('Rejestratorka')
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setRoleOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const chooseRole = (r: string) => { setRole(r); setRoleOpen(false) }

  return (
    <div className="login-card">
      <h1 id="login-title">MedicalClinc</h1>
      <p className="login-subtitle">Załóż konto i zacznij korzystać z systemu.</p>

      <form className="login-form register-form">
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
          <div className="select-shell" ref={ref}>
            <button type="button" className="select-trigger" onClick={() => setRoleOpen(v => !v)} aria-expanded={roleOpen}>
              <span>{role}</span>
              <span className={roleOpen ? 'select-arrow open' : 'select-arrow'} />
            </button>
            {roleOpen && (
              <div className="select-menu">
                <button type="button" className={role === 'Admin' ? 'select-option active' : 'select-option'} onMouseDown={() => chooseRole('Admin')}>Admin</button>
                <button type="button" className={role === 'Lekarz' ? 'select-option active' : 'select-option'} onMouseDown={() => chooseRole('Lekarz')}>Lekarz</button>
                <button type="button" className={role === 'Rejestratorka' ? 'select-option active' : 'select-option'} onMouseDown={() => chooseRole('Rejestratorka')}>Rejestratorka</button>
              </div>
            )}
          </div>
        </div>

        <button type="button" className="login-button primary">Stwórz konto</button>
      </form>
    </div>
  )
}
