import { useState, useEffect } from 'react'
import { api, type VisitDto, type PatientDetailDto, type MedicalRecordDto, type MedicalDocumentDto } from '../api/api.ts'
import { Alert } from '../components/Alert.tsx'
import { Modal } from '../components/Modal.tsx'

export const DoctorPanel = () => {
  // State
  const [visits, setVisits] = useState<VisitDto[]>([])
  const [selectedVisit, setSelectedVisit] = useState<VisitDto | null>(null)
  
  // Selected Patient details state
  const [patient, setPatient] = useState<PatientDetailDto | null>(null)
  const [record, setRecord] = useState<MedicalRecordDto | null>(null)
  const [documents, setDocuments] = useState<MedicalDocumentDto[]>([])

  // Modal forms state
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<MedicalDocumentDto | null>(null)
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

  const loadTodayVisits = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.visits.getToday()
      // Doctor's visits are filtered by backend.
      setVisits(data)
    } catch (err: any) {
      setError(`Nie udało się załadować planu wizyt: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTodayVisits()
  }, [])

  const handleSelectVisit = async (vst: VisitDto) => {
    setSelectedVisit(vst)
    setLoading(true)
    setError(null)
    setPatient(null)
    setRecord(null)
    setDocuments([])
    
    try {
      // Fetch details of this patient
      const pDetails = await api.patients.getById(vst.patientId)
      setPatient(pDetails)

      const rec = await api.medicalRecords.getByPatientId(vst.patientId)
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

      const docs = await api.documents.getAll(vst.patientId)
      setDocuments(docs)
    } catch (err: any) {
      setError(`Nie udało się wczytać kartoteki pacjenta: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVisit) return
    setError(null)
    setSuccess(null)
    try {
      let saved
      if (record) {
        saved = await api.medicalRecords.update(selectedVisit.patientId, recordForm)
        setSuccess('Karta medyczna została zaktualizowana.')
      } else {
        saved = await api.medicalRecords.create(selectedVisit.patientId, recordForm)
        setSuccess('Karta medyczna została założona.')
      }
      setRecord(saved)
      setShowRecordModal(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVisit || !uploadFile) return
    setError(null)
    setSuccess(null)
    try {
      await api.documents.upload(selectedVisit.patientId, uploadFile, uploadDesc)
      setSuccess('Wynik badania/dokument został załączony.')
      setUploadFile(null)
      setUploadDesc('')
      // Reload docs
      const docs = await api.documents.getAll(selectedVisit.patientId)
      setDocuments(docs)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteDoc = async (docId: number) => {
    if (!selectedVisit || !confirm('Czy usunąć ten dokument medyczny?')) return
    setError(null)
    setSuccess(null)
    try {
      await api.documents.delete(selectedVisit.patientId, docId)
      setSuccess('Dokument usunięty.')
      // Reload docs
      const docs = await api.documents.getAll(selectedVisit.patientId)
      setDocuments(docs)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="tab-pane-two-columns animate-fade">
      {/* Left Column - Today's Schedule */}
      <div className="list-column" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
        <h3 className="section-title" style={{ color: 'var(--text-primary)' }}>Dzisiejszy harmonogram przyjęć</h3>

        {loading && !selectedVisit && <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><div className="spinner"></div></div>}

        {visits.length === 0 ? (
          <div className="empty-state-box" style={{ background: 'var(--background)', color: 'var(--text-secondary)', border: '1px dashed var(--surface-border)', padding: '30px', textAlign: 'center', borderRadius: '12px' }}>
            Brak zaplanowanych pacjentów na dzisiejszy dzień.
          </div>
        ) : (
          <div className="visits-list">
            {visits.map(v => {
              const vTime = new Date(v.scheduledAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
              return (
                <div
                  key={v.id}
                  className={`visit-row-card ${selectedVisit?.id === v.id ? 'active' : ''} ${v.status.toLowerCase()}`}
                  onClick={() => handleSelectVisit(v)}
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
                >
                  <div className="visit-time" style={{ color: 'var(--text-primary)' }}>{vTime}</div>
                  <div className="visit-main-info">
                    <span className="visit-patient-name" style={{ color: 'var(--text-primary)' }}>{v.patientFullName}</span>
                    <span className="visit-doctor-name" style={{ color: 'var(--text-secondary)' }}>PESEL: {v.patientPesel}</span>
                  </div>
                  <div className="visit-status-tag">
                    <span className={`status-badge ${v.status.toLowerCase()}`}>
                      {v.status === 'Planned' ? 'Zaplanowana' :
                       v.status === 'InProgress' ? 'W toku' :
                       v.status === 'Completed' ? 'Zakończona' : 'Anulowana'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right Column - Visit Consultation Details */}
      <div className="detail-column">
        <Alert message={error} type="error" onClose={() => setError(null)} />
        <Alert message={success} type="success" onClose={() => setSuccess(null)} />

        {selectedVisit && patient ? (
          <div className="detail-card-full" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
            <span className="card-tag">Konsultacja Lekarska</span>
            
            <div className="visit-detail-patient" style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '15px' }}>
              <div className="avatar-large">
                {patient.firstName[0]}{patient.lastName[0]}
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)' }}>{patient.lastName} {patient.firstName}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>PESEL: {patient.pesel} · Telefon: {patient.phoneNumber || 'brak'}</p>
              </div>
            </div>

            {selectedVisit.notes && (
              <div className="visit-notes-display" style={{ background: 'var(--background)', border: '1px solid var(--surface-border)', marginBottom: '20px' }}>
                <strong style={{ color: 'var(--primary)' }}>Wywiad i objawy (Rejestracja):</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{selectedVisit.notes}</p>
              </div>
            )}

            {/* Medical Record Card */}
            <div className="sub-section" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="sub-section-header">
                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>Karta Medyczna Pacjenta</h4>
                <button className="btn-text-action" onClick={() => setShowRecordModal(true)}>
                  Modyfikuj Kartę Medyczną
                </button>
              </div>

              {record ? (
                <div className="record-details-card" style={{ background: 'var(--background)', border: '1px solid var(--surface-border)' }}>
                  <div className="record-grid">
                    <div className="record-item">
                      <span className="r-label" style={{ color: 'var(--text-secondary)' }}>Ubezpieczenie</span>
                      <span className="r-val" style={{ color: 'var(--text-primary)' }}>{record.insuranceNumber}</span>
                    </div>
                    <div className="record-item">
                      <span className="r-label" style={{ color: 'var(--text-secondary)' }}>Grupa krwi</span>
                      <span className="r-val highlight" style={{ color: 'var(--primary)', fontWeight: '700' }}>{record.bloodType || 'Brak'}</span>
                    </div>
                    <div className="record-item-full" style={{ marginTop: '8px' }}>
                      <span className="r-label" style={{ color: 'var(--text-secondary)' }}>Uczulenia i alergie</span>
                      <span className="r-val text-danger" style={{ color: 'var(--danger)' }}>{record.allergies || 'Brak'}</span>
                    </div>
                    <div className="record-item-full" style={{ marginTop: '8px' }}>
                      <span className="r-label" style={{ color: 'var(--text-secondary)' }}>Uwagi lekarskie (przebieg chorób)</span>
                      <span className="r-val" style={{ color: 'var(--text-primary)' }}>{record.notes || 'Brak.'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-record-box" style={{ background: 'var(--background)', border: '1px dashed var(--surface-border)' }}>
                  Pacjent nie posiada założonej karty medycznej. Użyj przycisku wyżej, aby ją dodać.
                </div>
              )}
            </div>

            {/* Medical Documents */}
            <div className="sub-section" style={{ borderTop: '1px solid var(--surface-border)' }}>
              <h4 style={{ color: 'var(--text-primary)', fontWeight: '700', marginBottom: '15px' }}>Dokumenty medyczne (wyniki badań, RTG)</h4>
              
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
                  style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
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
                  Załącz
                </button>
              </form>

              {documents.length === 0 ? (
                <p className="empty-message-inline" style={{ color: 'var(--text-muted)' }}>Brak załączonych wyników badań.</p>
              ) : (
                <div className="documents-list">
                  {documents.map(doc => (
                    <div key={doc.id} className="document-row" style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}>
                      <div className="doc-meta">
                        <svg className="doc-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <div>
                          <span className="doc-filename" style={{ color: 'var(--text-primary)' }}>{doc.fileName}</span>
                          <span className="doc-desc" style={{ color: 'var(--text-secondary)' }}>{doc.description || 'Brak opisu'}</span>
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

          </div>
        ) : (
          <div className="detail-empty-state" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-muted)' }}>
              <path d="M4.5 16.5c-1.5 1.26-2 3-2 3h19s-.5-1.74-2-3" />
              <path d="M19.5 9.5c0 4.14-3.36 7.5-7.5 7.5s-7.5-3.36-7.5-7.5 3.36-7.5 7.5-7.5 7.5 3.36 7.5 7.5Z" />
            </svg>
            <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
              Wybierz pacjenta z dzisiejszej listy przyjęć po lewej, aby rozpocząć konsultację medyczną, sprawdzić kartę chorób i załączone wyniki.
            </p>
          </div>
        )}
      </div>

      {/* Medical Record Modal */}
      <Modal isOpen={showRecordModal} onClose={() => setShowRecordModal(false)} title="Aktualizuj kartę zdrowia pacjenta">
        <form onSubmit={handleSaveRecord} className="modal-form-grid-single">
          <label style={{ color: 'var(--text-primary)' }}>
            Numer ubezpieczenia
            <input type="text" required value={recordForm.insuranceNumber} onChange={(e) => setRecordForm({ ...recordForm, insuranceNumber: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            Grupa krwi
            <input type="text" value={recordForm.bloodType} onChange={(e) => setRecordForm({ ...recordForm, bloodType: e.target.value })} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            Uczulenia i alergie
            <textarea value={recordForm.allergies} onChange={(e) => setRecordForm({ ...recordForm, allergies: e.target.value })} rows={2} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <label style={{ color: 'var(--text-primary)' }}>
            Uwagi kliniczne (przebieg chorób, przewlekłe dolegliwości)
            <textarea value={recordForm.notes} onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })} rows={4} style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }} />
          </label>
          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={() => setShowRecordModal(false)}>Anuluj</button>
            <button type="submit" className="btn-primary">Zapisz kartę pacjenta</button>
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
