import React, { useState, useEffect } from 'react'
import { api, type MedicationListDto } from '../api/api.ts'
import { useAuth } from '../context/AuthContext.tsx'
import { Alert } from '../components/Alert.tsx'
import { Modal } from '../components/Modal.tsx'

export const MedicationsCatalog: React.FC = () => {
  const { user } = useAuth()
  const canManage = user?.role === 'Admin' || user?.role === 'Rejestratorka'

  const [medications, setMedications] = useState<MedicationListDto[]>([])
  const [selectedMedication, setSelectedMedication] = useState<MedicationListDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Modals & Forms
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const [newMed, setNewMed] = useState({
    name: '',
    unitPrice: '',
    description: '',
  })

  const [editMed, setEditMed] = useState({
    name: '',
    unitPrice: '',
    description: '',
  })

  const loadMedications = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.medications.getAll()
      setMedications(data)
    } catch (err: any) {
      setError(`Nie udało się pobrać katalogu leków: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMedications()
  }, [])

  const handleSelectMedication = (med: MedicationListDto) => {
    setSelectedMedication(med)
  }

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const created = await api.medications.create({
        name: newMed.name,
        unitPrice: parseFloat(newMed.unitPrice) || 0,
        description: newMed.description || null,
      })
      setSuccess(`Dodano nowy lek: ${created.name}`)
      setShowAddModal(false)
      setNewMed({ name: '', unitPrice: '', description: '' })
      loadMedications()
      setSelectedMedication(created)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdateMedication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMedication) return
    setError(null)
    setSuccess(null)
    try {
      const updated = await api.medications.update(selectedMedication.id, {
        name: editMed.name,
        unitPrice: parseFloat(editMed.unitPrice) || 0,
        description: editMed.description || null,
      })
      setSuccess(`Zaktualizowano lek: ${updated.name}`)
      setShowEditModal(false)
      setSelectedMedication(updated)
      loadMedications()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteMedication = async () => {
    if (!selectedMedication) return
    if (!confirm(`Czy na pewno chcesz usunąć lek: "${selectedMedication.name}"?`)) return
    setError(null)
    setSuccess(null)
    try {
      await api.medications.delete(selectedMedication.id)
      setSuccess('Lek został pomyślnie usunięty z katalogu.')
      setSelectedMedication(null)
      loadMedications()
    } catch (err: any) {
      setError(`Błąd usuwania: ${err.message}`)
    }
  }

  const filteredMeds = medications.filter(med =>
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (med.description && med.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="tab-pane-two-columns animate-fade">
      {/* Left Column - List */}
      <div className="list-column" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
        <div className="search-header-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Wyszukaj lek po nazwie lub opisie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            />
          </div>
          {canManage && (
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              + Dodaj Lek
            </button>
          )}
        </div>

        {loading && !selectedMedication && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <div className="spinner"></div>
          </div>
        )}

        {filteredMeds.length === 0 ? (
          <p className="empty-message" style={{ color: 'var(--text-muted)' }}>Brak leków w katalogu.</p>
        ) : (
          <div className="patient-list-cards" style={{ maxHeight: '550px', overflowY: 'auto' }}>
            {filteredMeds.map(m => (
              <div
                key={m.id}
                className={`patient-list-card ${selectedMedication?.id === m.id ? 'active' : ''}`}
                onClick={() => handleSelectMedication(m)}
                style={{ border: '1px solid var(--surface-border)' }}
              >
                <div className="patient-card-initials" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  Rx
                </div>
                <div className="patient-card-info" style={{ flexGrow: 1 }}>
                  <span className="p-card-name" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                  <span className="p-card-pesel" style={{ color: 'var(--success)', fontWeight: 'bold' }}>{m.unitPrice.toFixed(2)} zł</span>
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

        {selectedMedication ? (
          <div className="detail-card-full" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
            <span className="card-tag" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
              Preparat Medyczny
            </span>

            <div className="detail-card-header-main" style={{ borderBottom: '1px solid var(--surface-border)', marginTop: '15px' }}>
              <div className="avatar-huge" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                {selectedMedication.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="header-info">
                <h2 style={{ color: 'var(--text-primary)' }}>{selectedMedication.name}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>ID leku: <strong>#{selectedMedication.id}</strong></p>
              </div>
            </div>

            <div className="detail-grid" style={{ gridTemplateColumns: '1fr', gap: '15px' }}>
              <div className="grid-item">
                <span className="label" style={{ color: 'var(--text-muted)' }}>Cena za opakowanie / jednostkę</span>
                <span className="val" style={{ color: 'var(--success)', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  {selectedMedication.unitPrice.toFixed(2)} zł
                </span>
              </div>
              <div className="grid-item" style={{ marginTop: '10px' }}>
                <span className="label" style={{ color: 'var(--text-muted)' }}>Opis preparatu i dawkowanie</span>
                <span className="val" style={{ color: 'var(--text-primary)', fontWeight: 'normal', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {selectedMedication.description || 'Brak dodatkowego opisu preparatu.'}
                </span>
              </div>
            </div>

            {canManage && (
              <div className="patient-action-bar" style={{ display: 'flex', gap: '10px', marginTop: '30px', borderTop: '1px solid var(--surface-border)', paddingTop: '20px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditMed({
                      name: selectedMedication.name,
                      unitPrice: selectedMedication.unitPrice.toString(),
                      description: selectedMedication.description || '',
                    })
                    setShowEditModal(true)
                  }}
                >
                  Edytuj lek
                </button>
                <button className="btn-danger" onClick={handleDeleteMedication}>
                  Usuń lek
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="detail-empty-state" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-muted)' }}>
              <path d="m10.5 22 7.5-7.5-4.5-4.5L6 17.5 10.5 22Z" />
              <path d="m14 14 3-3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M9.5 9.5 13 13" />
            </svg>
            <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
              Wybierz preparat z katalogu po lewej stronie, aby załadować szczegółowy opis i cenę jednostkową.
            </p>
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Dodaj nowy lek do katalogu">
        <form onSubmit={handleCreateMedication} className="modal-form-grid-single">
          <label style={{ color: 'var(--text-primary)' }}>
            Nazwa handlowa / substancja czynna
            <input
              type="text"
              required
              value={newMed.name}
              onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
              placeholder="np. Paracetamol 500mg"
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Cena jednostkowa (zł)
            <input
              type="number"
              step="0.01"
              required
              min="0"
              value={newMed.unitPrice}
              onChange={(e) => setNewMed({ ...newMed, unitPrice: e.target.value })}
              placeholder="np. 15.99"
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Opis, postać i opakowanie
            <textarea
              rows={4}
              value={newMed.description}
              onChange={(e) => setNewMed({ ...newMed, description: e.target.value })}
              placeholder="np. Tabletki powlekane, 20 szt. Stosować w stanach gorączkowych..."
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', padding: '8px 12px' }}
            />
          </label>

          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Anuluj</button>
            <button type="submit" className="btn-primary">Dodaj lek</button>
          </div>
        </form>
      </Modal>

      {/* Edit Medication Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edytuj dane leku">
        <form onSubmit={handleUpdateMedication} className="modal-form-grid-single">
          <label style={{ color: 'var(--text-primary)' }}>
            Nazwa handlowa
            <input
              type="text"
              required
              value={editMed.name}
              onChange={(e) => setEditMed({ ...editMed, name: e.target.value })}
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Cena jednostkowa (zł)
            <input
              type="number"
              step="0.01"
              required
              min="0"
              value={editMed.unitPrice}
              onChange={(e) => setEditMed({ ...editMed, unitPrice: e.target.value })}
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Opis, postać i opakowanie
            <textarea
              rows={4}
              value={editMed.description}
              onChange={(e) => setEditMed({ ...editMed, description: e.target.value })}
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', padding: '8px 12px' }}
            />
          </label>

          <div className="modal-actions-row" style={{ marginTop: '20px' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Anuluj</button>
            <button type="submit" className="btn-primary">Zapisz zmiany</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
