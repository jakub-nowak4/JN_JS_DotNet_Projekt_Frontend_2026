import React, { useState, useEffect } from 'react'
import { api, type ProcedureDto } from '../api/api.ts'
import { useAuth } from '../context/AuthContext.tsx'
import { Alert } from '../components/Alert.tsx'
import { Modal } from '../components/Modal.tsx'

export const ProceduresCatalog: React.FC = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'

  const [procedures, setProcedures] = useState<ProcedureDto[]>([])
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Modals & Forms
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const [newProc, setNewProc] = useState({
    name: '',
    description: '',
    defaultCost: '',
  })

  const [editProc, setEditProc] = useState({
    name: '',
    description: '',
    defaultCost: '',
    isActive: true,
  })

  const loadProcedures = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.procedures.getAll()
      setProcedures(data)
    } catch (err: any) {
      setError(`Nie udało się pobrać katalogu procedur: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProcedures()
  }, [])

  const handleSelectProcedure = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const details = await api.procedures.getById(id)
      setSelectedProcedure(details)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProcedure = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const created = await api.procedures.create({
        name: newProc.name,
        description: newProc.description,
        defaultCost: parseFloat(newProc.defaultCost) || 0,
      })
      setSuccess(`Dodano nową procedurę: ${created.name}`)
      setShowAddModal(false)
      setNewProc({ name: '', description: '', defaultCost: '' })
      loadProcedures()
      setSelectedProcedure(created)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdateProcedure = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProcedure) return
    setError(null)
    setSuccess(null)
    try {
      const updated = await api.procedures.update(selectedProcedure.id, {
        name: editProc.name,
        description: editProc.description,
        defaultCost: parseFloat(editProc.defaultCost) || 0,
        isActive: editProc.isActive,
      })
      setSuccess(`Zaktualizowano procedurę: ${updated.name}`)
      setShowEditModal(false)
      setSelectedProcedure(updated)
      loadProcedures()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteProcedure = async () => {
    if (!selectedProcedure) return
    if (!confirm(`Czy na pewno chcesz usunąć procedurę: "${selectedProcedure.name}"?`)) return
    setError(null)
    setSuccess(null)
    try {
      const res = await api.procedures.delete(selectedProcedure.id)
      setSuccess(res.message || 'Procedura została pomyślnie usunięta.')
      setSelectedProcedure(null)
      loadProcedures()
    } catch (err: any) {
      setError(`Błąd usuwania: ${err.message}`)
    }
  }

  const filteredProcedures = procedures.filter(proc =>
    proc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    proc.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="tab-pane-two-columns animate-fade">
      {/* Left Column - List */}
      <div className="list-column" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
        <div className="search-header-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Wyszukaj procedurę po nazwie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            />
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              + Dodaj Procedurę
            </button>
          )}
        </div>

        {loading && !selectedProcedure && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <div className="spinner"></div>
          </div>
        )}

        {filteredProcedures.length === 0 ? (
          <p className="empty-message" style={{ color: 'var(--text-muted)' }}>Brak procedur w katalogu.</p>
        ) : (
          <div className="patient-list-cards" style={{ maxHeight: '550px', overflowY: 'auto' }}>
            {filteredProcedures.map(p => (
              <div
                key={p.id}
                className={`patient-list-card ${selectedProcedure?.id === p.id ? 'active' : ''}`}
                onClick={() => handleSelectProcedure(p.id)}
                style={{ border: '1px solid var(--surface-border)' }}
              >
                <div className="patient-card-initials" style={{ background: p.isActive ? 'var(--primary-light)' : 'var(--background)', color: p.isActive ? 'var(--primary)' : 'var(--text-muted)' }}>
                  Pr
                </div>
                <div className="patient-card-info" style={{ flexGrow: 1 }}>
                  <span className="p-card-name" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                  <span className="p-card-pesel" style={{ color: 'var(--success)', fontWeight: 'bold' }}>{p.defaultCost.toFixed(2)} zł</span>
                </div>
                <div>
                  <span className={`status-pill ${p.isActive ? 'approved' : 'pending'}`} style={{ fontSize: '0.75rem' }}>
                    {p.isActive ? 'Aktywna' : 'Nieaktywna'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column - Details */}
      <div className="detail-column">
        <Alert message={error} type="error" onClose={() => setError(null)} />
        <Alert message={success} type="success" onClose={() => setSuccess(null)} />

        {selectedProcedure ? (
          <div className="detail-card-full" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
            <span className="card-tag" style={{ background: selectedProcedure.isActive ? 'var(--success-light)' : 'var(--danger-light)', color: selectedProcedure.isActive ? 'var(--success)' : 'var(--danger)' }}>
              Procedura Medyczna
            </span>

            <div className="detail-card-header-main" style={{ borderBottom: '1px solid var(--surface-border)', marginTop: '15px' }}>
              <div className="avatar-huge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                {selectedProcedure.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="header-info">
                <h2 style={{ color: 'var(--text-primary)' }}>{selectedProcedure.name}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Status: <strong>{selectedProcedure.isActive ? 'Aktywna' : 'Nieaktywna'}</strong></p>
              </div>
            </div>

            <div className="detail-grid" style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
              <div className="grid-item">
                <span className="label" style={{ color: 'var(--text-muted)' }}>Cena standardowa</span>
                <span className="val" style={{ color: 'var(--success)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  {selectedProcedure.defaultCost.toFixed(2)} zł
                </span>
              </div>
              <div className="grid-item" style={{ marginTop: '10px' }}>
                <span className="label" style={{ color: 'var(--text-muted)' }}>Opis i wskazania</span>
                <span className="val" style={{ color: 'var(--text-primary)', fontWeight: 'normal', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {selectedProcedure.description || 'Brak opisu procedury.'}
                </span>
              </div>
              <div className="grid-item" style={{ marginTop: '10px' }}>
                <span className="label" style={{ color: 'var(--text-muted)' }}>Data dodania</span>
                <span className="val" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {new Date(selectedProcedure.createdAt).toLocaleDateString('pl-PL')}
                </span>
              </div>
            </div>

            {isAdmin && (
              <div className="patient-action-bar" style={{ display: 'flex', gap: '10px', marginTop: '30px', borderTop: '1px solid var(--surface-border)', paddingTop: '20px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditProc({
                      name: selectedProcedure.name,
                      description: selectedProcedure.description,
                      defaultCost: selectedProcedure.defaultCost.toString(),
                      isActive: selectedProcedure.isActive,
                    })
                    setShowEditModal(true)
                  }}
                >
                  Edytuj procedurę
                </button>
                <button className="btn-danger" onClick={handleDeleteProcedure}>
                  Usuń procedurę
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="detail-empty-state" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-muted)' }}>
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
              Wybierz procedurę z katalogu po lewej stronie, aby załadować szczegółowy opis i cenę.
            </p>
          </div>
        )}
      </div>

      {/* Add Procedure Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Dodaj nową procedurę medyczną">
        <form onSubmit={handleCreateProcedure} className="modal-form-grid-single">
          <label style={{ color: 'var(--text-primary)' }}>
            Nazwa procedury
            <input
              type="text"
              required
              value={newProc.name}
              onChange={(e) => setNewProc({ ...newProc, name: e.target.value })}
              placeholder="np. USG jamy brzusznej"
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Cena standardowa (zł)
            <input
              type="number"
              step="0.01"
              required
              min="0"
              value={newProc.defaultCost}
              onChange={(e) => setNewProc({ ...newProc, defaultCost: e.target.value })}
              placeholder="np. 150.00"
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Opis procedury i wymagania
            <textarea
              required
              rows={4}
              value={newProc.description}
              onChange={(e) => setNewProc({ ...newProc, description: e.target.value })}
              placeholder="Opisz jak należy przygotować się do badania oraz przebieg..."
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', padding: '8px 12px' }}
            />
          </label>

          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Anuluj</button>
            <button type="submit" className="btn-primary">Dodaj procedurę</button>
          </div>
        </form>
      </Modal>

      {/* Edit Procedure Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edytuj procedurę medyczną">
        <form onSubmit={handleUpdateProcedure} className="modal-form-grid-single">
          <label style={{ color: 'var(--text-primary)' }}>
            Nazwa procedury
            <input
              type="text"
              required
              value={editProc.name}
              onChange={(e) => setEditProc({ ...editProc, name: e.target.value })}
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Cena standardowa (zł)
            <input
              type="number"
              step="0.01"
              required
              min="0"
              value={editProc.defaultCost}
              onChange={(e) => setEditProc({ ...editProc, defaultCost: e.target.value })}
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Opis procedury i wymagania
            <textarea
              required
              rows={4}
              value={editProc.description}
              onChange={(e) => setEditProc({ ...editProc, description: e.target.value })}
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', padding: '8px 12px' }}
            />
          </label>

          <div className="remember-me-row" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="isActiveProc"
              checked={editProc.isActive}
              onChange={(e) => setEditProc({ ...editProc, isActive: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="isActiveProc" style={{ cursor: 'pointer', fontWeight: 'bold' }}>Procedura aktywna (widoczna dla lekarzy)</label>
          </div>

          <div className="modal-actions-row" style={{ marginTop: '20px' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Anuluj</button>
            <button type="submit" className="btn-primary">Zapisz zmiany</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
