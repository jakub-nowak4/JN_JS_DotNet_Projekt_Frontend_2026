import React, { useState, useEffect } from 'react'
import { api, type PendingUserDto, type UserDto } from '../api/api.ts'
import { Alert } from '../components/Alert.tsx'

export const AdminPanel: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUserDto[]>([])
  const [allUsers, setAllUsers] = useState<UserDto[]>([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const pending = await api.admin.getPendingUsers()
      const all = await api.admin.getAllUsers()
      setPendingUsers(pending)
      setAllUsers(all)
    } catch (err: any) {
      setError(`Nie udało się załadować danych użytkowników: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApprove = async (id: string) => {
    setError(null)
    setSuccess(null)
    try {
      await api.admin.approveUser(id)
      setSuccess('Użytkownik został pomyślnie zatwierdzony.')
      loadData()
    } catch (err: any) {
      setError(`Błąd zatwierdzania: ${err.message}`)
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('Czy na pewno chcesz odrzucić rejestrację i usunąć to konto?')) return
    setError(null)
    setSuccess(null)
    try {
      await api.admin.rejectUser(id)
      setSuccess('Wniosek o rejestrację został odrzucony.')
      loadData()
    } catch (err: any) {
      setError(`Błąd odrzucania: ${err.message}`)
    }
  }

  return (
    <div className="tab-pane animate-fade" style={{ position: 'relative', border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
      <Alert message={error} type="error" onClose={() => setError(null)} />
      <Alert message={success} type="success" onClose={() => setSuccess(null)} />

      {loading && <div className="loading-spinner-overlay"><div className="spinner"></div></div>}

      <h3 className="section-title" style={{ color: 'var(--text-primary)' }}>Wnioski rejestracyjne personelu</h3>
      {pendingUsers.length === 0 ? (
        <p className="empty-message" style={{ color: 'var(--text-muted)' }}>Brak wniosków oczekujących na zatwierdzenie.</p>
      ) : (
        <div className="table-responsive" style={{ border: '1px solid var(--surface-border)' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: 'var(--background)' }}>
                <th style={{ color: 'var(--text-secondary)' }}>Imię i nazwisko</th>
                <th style={{ color: 'var(--text-secondary)' }}>E-mail</th>
                <th style={{ color: 'var(--text-secondary)' }}>Rola</th>
                <th style={{ color: 'var(--text-secondary)' }}>Data rejestracji</th>
                <th style={{ color: 'var(--text-secondary)' }}>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ color: 'var(--text-primary)' }}><strong>{u.fullName}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{new Date(u.registeredAt).toLocaleString('pl-PL')}</td>
                  <td>
                    <div className="action-buttons-cell">
                      <button className="btn-approve" onClick={() => handleApprove(u.id)}>Zatwierdź</button>
                      <button className="btn-reject" onClick={() => handleReject(u.id)}>Odrzuć</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="section-title" style={{ marginTop: '40px', color: 'var(--text-primary)' }}>Wszyscy zarejestrowani pracownicy</h3>
      {allUsers.length === 0 ? (
        <p className="empty-message" style={{ color: 'var(--text-muted)' }}>Brak zarejestrowanych pracowników w bazie.</p>
      ) : (
        <div className="table-responsive" style={{ border: '1px solid var(--surface-border)' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: 'var(--background)' }}>
                <th style={{ color: 'var(--text-secondary)' }}>Imię i nazwisko</th>
                <th style={{ color: 'var(--text-secondary)' }}>E-mail</th>
                <th style={{ color: 'var(--text-secondary)' }}>Rola</th>
                <th style={{ color: 'var(--text-secondary)' }}>Status konta</th>
                <th style={{ color: 'var(--text-secondary)' }}>Data zatwierdzenia</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ color: 'var(--text-primary)' }}><strong>{u.fullName}</strong></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role.toLowerCase()}`}>{u.role}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${u.isApproved ? 'approved' : 'pending'}`}>
                      {u.isApproved ? 'Zatwierdzony' : 'Oczekujący'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {u.approvedAt ? new Date(u.approvedAt).toLocaleDateString('pl-PL') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
