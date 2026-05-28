import '/src/App.css';

export default function Login({ onOpenRegister }: { onOpenRegister?: () => void }) {
  return (
    <div className="login-card" aria-labelledby="login-title">
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
          <button type="button" className="text-link" onClick={onOpenRegister}>
            Stwórz konto
          </button>
        </p>
      </form>
    </div>
  )
}
