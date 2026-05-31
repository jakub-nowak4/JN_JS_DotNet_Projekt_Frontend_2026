import React, { useState, useEffect } from 'react'
import { api, type PatientListDto, type PatientDetailDto, type MedicalRecordDto, type MedicalDocumentDto, type VisitDto } from '../api/api.ts'
import { useAuth } from '../context/AuthContext.tsx'
import { Alert } from '../components/Alert.tsx'
import { Modal } from '../components/Modal.tsx'

export const PatientList: React.FC = () => {
  const { user } = useAuth()
  const canManage = user?.role === 'Admin' || user?.role === 'Rejestratorka'

  // Data States
  const [patients, setPatients] = useState<PatientListDto[]>([])
  const [selectedPatient, setSelectedPatient] = useState<PatientDetailDto | null>(null)
  
  // Selected Patient Details States
  const [record, setRecord] = useState<MedicalRecordDto | null>(null)
  const [documents, setDocuments] = useState<MedicalDocumentDto[]>([])
  const [visits, setVisits] = useState<VisitDto[]>([])

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<MedicalDocumentDto | null>(null)

  // Form States
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    pesel: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
  })

  const [editPatient, setEditPatient] = useState({
    firstName: '',
    lastName: '',
    pesel: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
  })

  const [recordForm, setRecordForm] = useState({
    insuranceNumber: '',
    bloodType: '',
    allergies: '',
    notes: '',
  })

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDesc, setUploadDesc] = useState('')

  // Notifications
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadPatients = async (query = '') => {
    setLoading(true)
    setError(null)
    try {
      let data: PatientListDto[]
      if (query.trim()) {
        data = await api.patients.search(query)
      } else {
        data = await api.patients.getAll()
      }
      setPatients(data)
    } catch (err: any) {
      setError(`Nie udało się pobrać pacjentów: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const handleSelectPatient = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const details = await api.patients.getById(id)
      setSelectedPatient(details)

      const rec = await api.medicalRecords.getByPatientId(id)
      setRecord(rec)
      if (rec) {
        setRecordForm({
          insuranceNumber: rec.insuranceNumber || '',
          bloodType: rec.bloodType || '',
          allergies: rec.allergies || '',
          notes: rec.notes || '',
        })
      } else {
        setRecordForm({
          insuranceNumber: '',
          bloodType: '',
          allergies: '',
          notes: '',
        })
      }

      const docs = await api.documents.getAll(id)
      setDocuments(docs)

      const vsts = await api.patients.getVisits(id)
      setVisits(vsts)
    } catch (err: any) {
      setError(`Nie udało się wczytać danych pacjenta: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const created = await api.patients.create(newPatient)
      setSuccess(`Pomyślnie dodano pacjenta: ${created.firstName} ${created.lastName}`)
      setShowAddModal(false)
      setNewPatient({
        firstName: '',
        lastName: '',
        pesel: '',
        dateOfBirth: '',
        phoneNumber: '',
        email: '',
      })
      loadPatients()
      handleSelectPatient(created.id)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return
    setError(null)
    setSuccess(null)
    try {
      const updated = await api.patients.update(selectedPatient.id, editPatient)
      setSuccess('Dane osobowe pacjenta zostały zaktualizowane.')
      setShowEditModal(false)
      setSelectedPatient(updated)
      loadPatients()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeletePatient = async () => {
    if (!selectedPatient) return
    if (!confirm(`Czy na pewno chcesz usunąć pacjenta ${selectedPatient.firstName} ${selectedPatient.lastName} z kartoteki?`)) return
    setError(null)
    setSuccess(null)
    try {
      await api.patients.delete(selectedPatient.id)
      setSuccess('Pacjent został pomyślnie usunięty.')
      setSelectedPatient(null)
      loadPatients()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return
    setError(null)
    setSuccess(null)
    try {
      let saved
      if (record) {
        saved = await api.medicalRecords.update(selectedPatient.id, recordForm)
        setSuccess('Karta medyczna pacjenta została pomyślnie zaktualizowana.')
      } else {
        saved = await api.medicalRecords.create(selectedPatient.id, recordForm)
        setSuccess('Karta medyczna pacjenta została pomyślnie utworzona.')
      }
      setRecord(saved)
      setShowRecordModal(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient || !uploadFile) return
    setError(null)
    setSuccess(null)
    try {
      await api.documents.upload(selectedPatient.id, uploadFile, uploadDesc)
      setSuccess('Dokument medyczny został przesłany.')
      setUploadFile(null)
      setUploadDesc('')
      // Reload docs
      const docs = await api.documents.getAll(selectedPatient.id)
      setDocuments(docs)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteDoc = async (docId: number) => {
    if (!selectedPatient || !confirm('Czy na pewno chcesz usunąć ten dokument medyczny?')) return
    setError(null)
    setSuccess(null)
    try {
      await api.documents.delete(selectedPatient.id, docId)
      setSuccess('Dokument został usunięty.')
      // Reload docs
      const docs = await api.documents.getAll(selectedPatient.id)
      setDocuments(docs)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="tab-pane-two-columns animate-fade">
      {/* Left Column - List */}
      <div className="list-column" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
        <div className="search-header-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Wyszukaj po nazwisku lub PESEL..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                loadPatients(e.target.value)
              }}
              className="search-input"
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            />
          </div>
          {canManage && (
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              + Dodaj Pacjenta
            </button>
          )}
        </div>

        {loading && !selectedPatient && <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><div className="spinner"></div></div>}

        {patients.length === 0 ? (
          <p className="empty-message" style={{ color: 'var(--text-muted)' }}>Brak zarejestrowanych pacjentów.</p>
        ) : (
          <div className="patient-list-cards">
            {patients.map(p => (
              <div
                key={p.id}
                className={`patient-list-card ${selectedPatient?.id === p.id ? 'active' : ''}`}
                onClick={() => handleSelectPatient(p.id)}
                style={{ border: '1px solid var(--surface-border)' }}
              >
                <div className="patient-card-initials">
                  {p.firstName[0]}{p.lastName[0]}
                </div>
                <div className="patient-card-info">
                  <span className="p-card-name" style={{ color: 'var(--text-primary)' }}>{p.lastName} {p.firstName}</span>
                  <span className="p-card-pesel" style={{ color: 'var(--text-secondary)' }}>PESEL: {p.pesel}</span>
                  <span className="p-card-phone" style={{ color: 'var(--text-muted)' }}>Tel: {p.phoneNumber || 'brak'}</span>
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

        {selectedPatient ? (
          <div className="detail-card-full" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
            
            <div className="detail-card-header-main" style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <div className="avatar-huge">
                {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
              </div>
              <div className="header-info">
                <h2 style={{ color: 'var(--text-primary)' }}>{selectedPatient.lastName} {selectedPatient.firstName}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>PESEL: <strong style={{ color: 'var(--text-primary)' }}>{selectedPatient.pesel}</strong></p>
              </div>
            </div>

            <div className="detail-grid">
              <div className="grid-item">
                <span className="label" style={{ color: 'var(--text-muted)' }}>Data urodzenia</span>
                <span className="val" style={{ color: 'var(--text-primary)' }}>{selectedPatient.dateOfBirth}</span>
              </div>
              <div className="grid-item">
                <span className="label" style={{ color: 'var(--text-muted)' }}>Telefon</span>
                <span className="val" style={{ color: 'var(--text-primary)' }}>{selectedPatient.phoneNumber || 'brak'}</span>
              </div>
              <div className="grid-item">
                <span className="label" style={{ color: 'var(--text-muted)' }}>E-mail</span>
                <span className="val" style={{ color: 'var(--text-primary)' }}>{selectedPatient.email || 'brak'}</span>
              </div>
              <div className="grid-item">
                <span className="label" style={{ color: 'var(--text-muted)' }}>Dodano w kartotece</span>
                <span className="val" style={{ color: 'var(--text-primary)' }}>{new Date(selectedPatient.createdAt).toLocaleDateString('pl-PL')}</span>
              </div>
            </div>

            {canManage && (
              <div className="patient-action-bar" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditPatient({
                      firstName: selectedPatient.firstName,
                      lastName: selectedPatient.lastName,
                      pesel: selectedPatient.pesel,
                      dateOfBirth: selectedPatient.dateOfBirth,
                      phoneNumber: selectedPatient.phoneNumber || '',
                      email: selectedPatient.email || '',
                    })
                    setShowEditModal(true)
                  }}
                >
                  Edytuj dane
                </button>
                <button className="btn-danger" onClick={handleDeletePatient}>
                  Usuń z kartoteki
                </button>
              </div>
            )}

            {/* Medical Record Card */}
            <div className="sub-section" style={{ borderTop: '1px solid var(--surface-border)' }}>
              <div className="sub-section-header">
                <h3 style={{ color: 'var(--text-primary)' }}>Karta medyczna pacjenta</h3>
                <button className="btn-text-action" onClick={() => setShowRecordModal(true)}>
                  {record ? 'Edytuj kartę' : '+ Stwórz kartę'}
                </button>
              </div>

              {record ? (
                <div className="record-details-card" style={{ background: 'var(--background)', border: '1px solid var(--surface-border)' }}>
                  <div className="record-grid">
                    <div className="record-item">
                      <span className="r-label" style={{ color: 'var(--text-secondary)' }}>Numer ubezpieczenia</span>
                      <span className="r-val" style={{ color: 'var(--text-primary)' }}>{record.insuranceNumber}</span>
                    </div>
                    <div className="record-item">
                      <span className="r-label" style={{ color: 'var(--text-secondary)' }}>Grupa krwi</span>
                      <span className="r-val highlight" style={{ color: 'var(--primary)', fontWeight: '700' }}>{record.bloodType || 'Brak'}</span>
                    </div>
                    <div className="record-item-full" style={{ marginTop: '10px' }}>
                      <span className="r-label" style={{ color: 'var(--text-secondary)' }}>Uczulenia i alergie</span>
                      <span className="r-val text-danger" style={{ color: 'var(--danger)' }}>{record.allergies || 'Brak znanych uczuleń'}</span>
                    </div>
                    <div className="record-item-full" style={{ marginTop: '10px' }}>
                      <span className="r-label" style={{ color: 'var(--text-secondary)' }}>Uwagi lekarskie i notatki</span>
                      <span className="r-val" style={{ color: 'var(--text-primary)' }}>{record.notes || 'Brak uwag w karcie.'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-record-box" style={{ background: 'var(--background)', color: 'var(--text-secondary)', border: '1px dashed var(--surface-border)' }}>
                  Pacjent nie posiada jeszcze założonej karty ubezpieczeniowo-medycznej.
                </div>
              )}
            </div>

            {/* Documents Section */}
            <div className="sub-section" style={{ borderTop: '1px solid var(--surface-border)' }}>
              <h3 style={{ color: 'var(--text-primary)' }}>Dokumenty medyczne i załączniki</h3>
              
              <form className="mini-upload-form" onSubmit={handleUploadDoc} style={{ background: 'var(--background)' }}>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setUploadFile(e.target.files[0])
                    }
                  }}
                  required
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="file-input"
                  style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  placeholder="Opis pliku..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  required
                  className="file-description-input"
                  style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
                />
                <button type="submit" className="btn-secondary small" disabled={!uploadFile}>
                  Wgraj
                </button>
              </form>

              {documents.length === 0 ? (
                <p className="empty-message-inline" style={{ color: 'var(--text-muted)' }}>Brak wgranych plików.</p>
              ) : (
                <div className="documents-list">
                  {documents.map(doc => (
                    <div key={doc.id} className="document-row" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                      <div className="doc-meta">
                        <svg className="doc-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <div>
                          <span className="doc-filename" style={{ color: 'var(--text-primary)' }}>{doc.fileName}</span>
                          <span className="doc-desc" style={{ color: 'var(--text-secondary)' }}>{doc.description || 'Opis pusty'} · {new Date(doc.uploadedAt).toLocaleDateString('pl-PL')}</span>
                        </div>
                      </div>
                      <div className="doc-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button type="button" className="btn-text-action" style={{ fontSize: '0.8rem', padding: 0 }} onClick={() => setPreviewDoc(doc)}>Podgląd</button>
                        <a href={doc.fileUrl} download={doc.fileName} target="_blank" rel="noopener noreferrer" className="btn-download-link">Pobierz</a>
                        <button className="btn-delete-text" onClick={() => handleDeleteDoc(doc.id)}>Usuń</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visit History Section */}
            <div className="sub-section" style={{ borderTop: '1px solid var(--surface-border)' }}>
              <h3 style={{ color: 'var(--text-primary)' }}>Historia i rejestr wizyt</h3>
              {visits.length === 0 ? (
                <p className="empty-message-inline" style={{ color: 'var(--text-muted)' }}>Pacjent nie odbył jeszcze żadnych wizyt.</p>
              ) : (
                <div className="patient-visits-history">
                  {visits.map(v => (
                    <div key={v.id} className="visit-history-row" style={{ background: 'var(--background)', border: '1px solid var(--surface-border)' }}>
                      <div className="v-meta">
                        <span className="v-date" style={{ color: 'var(--text-primary)' }}>{new Date(v.scheduledAt).toLocaleDateString('pl-PL')} o {new Date(v.scheduledAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="v-doc" style={{ color: 'var(--text-secondary)' }}>Lekarz: {v.doctorFullName}</span>
                      </div>
                      <span className={`status-badge-inline ${v.status.toLowerCase()}`}>
                        {v.status === 'Planned' ? 'Zaplanowana' :
                         v.status === 'InProgress' ? 'W toku' :
                         v.status === 'Completed' ? 'Zakończona' : 'Anulowana'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="detail-empty-state" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-muted)' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
              Wybierz pacjenta z listy po lewej stronie, aby załadować szczegółową kartotekę medyczną, historię wizyt oraz dokumenty.
            </p>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Dodaj nowego pacjenta">
        <form onSubmit={handleCreatePatient} className="modal-form-grid">
          <label style={{ color: 'var(--text-primary)' }}>
            Imię
            <input type="text" required value={newPatient.firstName} onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            Nazwisko
            <input type="text" required value={newPatient.lastName} onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            PESEL
            <input type="text" required maxLength={11} minLength={11} value={newPatient.pesel} onChange={(e) => setNewPatient({ ...newPatient, pesel: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            Data urodzenia
            <input type="date" required value={newPatient.dateOfBirth} onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            Telefon
            <input type="tel" value={newPatient.phoneNumber} onChange={(e) => setNewPatient({ ...newPatient, phoneNumber: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            E-mail
            <input type="email" value={newPatient.email} onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Anuluj</button>
            <button type="submit" className="btn-primary">Dodaj do kartoteki</button>
          </div>
        </form>
      </Modal>

      {/* Edit Patient Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edytuj dane pacjenta">
        <form onSubmit={handleUpdatePatient} className="modal-form-grid">
          <label style={{ color: 'var(--text-primary)' }}>
            Imię
            <input type="text" required value={editPatient.firstName} onChange={(e) => setEditPatient({ ...editPatient, firstName: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            Nazwisko
            <input type="text" required value={editPatient.lastName} onChange={(e) => setEditPatient({ ...editPatient, lastName: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            PESEL
            <input type="text" required maxLength={11} minLength={11} value={editPatient.pesel} onChange={(e) => setEditPatient({ ...editPatient, pesel: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            Data urodzenia
            <input type="date" required value={editPatient.dateOfBirth} onChange={(e) => setEditPatient({ ...editPatient, dateOfBirth: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            Telefon
            <input type="tel" value={editPatient.phoneNumber} onChange={(e) => setEditPatient({ ...editPatient, phoneNumber: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            E-mail
            <input type="email" value={editPatient.email} onChange={(e) => setEditPatient({ ...editPatient, email: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Anuluj</button>
            <button type="submit" className="btn-primary">Zapisz poprawki</button>
          </div>
        </form>
      </Modal>

      {/* Medical Record Modal */}
      <Modal isOpen={showRecordModal} onClose={() => setShowRecordModal(false)} title={record ? 'Edytuj kartę medyczną' : 'Utwórz kartę medyczną'}>
        <form onSubmit={handleSaveRecord} className="modal-form-grid-single">
          <label style={{ color: 'var(--text-primary)' }}>
            Numer ubezpieczenia (np. NFZ)
            <input type="text" required value={recordForm.insuranceNumber} onChange={(e) => setRecordForm({ ...recordForm, insuranceNumber: e.target.value })} placeholder="Wpisz numer ubezpieczenia..." style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            Grupa krwi
            <input type="text" value={recordForm.bloodType} onChange={(e) => setRecordForm({ ...recordForm, bloodType: e.target.value })} placeholder="np. A Rh+" style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            Uczulenia i alergie
            <textarea value={recordForm.allergies} onChange={(e) => setRecordForm({ ...recordForm, allergies: e.target.value })} placeholder="Opisz uczulenia..." rows={2} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            Ogólne notatki kliniczne
            <textarea value={recordForm.notes} onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })} placeholder="Dodatkowe informacje..." rows={4} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={() => setShowRecordModal(false)}>Anuluj</button>
            <button type="submit" className="btn-primary">Zapisz kartotekę</button>
          </div>
        </form>
      </Modal>

      {/* Preview Document Modal */}
      <Modal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)} title={`Podgląd dokumentu: ${previewDoc?.fileName}`} width="min(800px, 95vw)">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          {previewDoc?.fileUrl.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={previewDoc.fileUrl}
              title="PDF Preview"
              style={{ width: '100%', height: '550px', borderRadius: '12px', border: '1px solid var(--surface-border)', background: '#ffffff' }}
            />
          ) : (
            <img
              src={previewDoc?.fileUrl}
              alt={previewDoc?.fileName}
              style={{ maxWidth: '100%', maxHeight: '550px', borderRadius: '12px', objectFit: 'contain', border: '1px solid var(--surface-border)' }}
            />
          )}
          {previewDoc?.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '5px' }}>
              <strong>Opis:</strong> {previewDoc.description}
            </p>
          )}
          <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'flex-end', marginTop: '10px' }}>
            <a href={previewDoc?.fileUrl} download={previewDoc?.fileName} className="btn-primary" style={{ height: '38px', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Pobierz plik
            </a>
            <button type="button" className="btn-secondary" style={{ height: '38px', fontSize: '0.85rem' }} onClick={() => setPreviewDoc(null)}>
              Zamknij
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
