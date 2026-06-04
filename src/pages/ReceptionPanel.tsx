import React, { useState, useEffect } from 'react'
import { api, type VisitDto, type PatientListDto } from '../api/api.ts'
import { Alert } from '../components/Alert.tsx'
import { Modal } from '../components/Modal.tsx'

export const ReceptionPanel: React.FC = () => {
  // Filters State
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0])
  const [scheduleStatus, setScheduleStatus] = useState<string>('All')
  const [scheduleDoctorId, setScheduleDoctorId] = useState<string>('All')

  // Data States
  const [visits, setVisits] = useState<VisitDto[]>([])
  const [patients, setPatients] = useState<PatientListDto[]>([])
  const [doctorsList, setDoctorsList] = useState<{ id: string; fullName: string }[]>([])
  
  // Selected Item Detail State
  const [selectedVisit, setSelectedVisit] = useState<VisitDto | null>(null)

  // Modals & Forms
  const [showAddModal, setShowAddModal] = useState(false)
  const [newVisit, setNewVisit] = useState({
    patientId: '',
    doctorId: '',
    scheduledAt: '',
    notes: '',
  })

  // Notifications
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Load doctors and patients initially
  const loadInitialOptions = async () => {
    try {
      // 1. Fetch patients
      const pData = await api.patients.getAll()
      setPatients(pData)

      // 2. Fetch doctors (try Admin service, fallback to visits mapping on error)
      try {
        const users = await api.admin.getAllUsers()
        const docs = users.filter(u => u.role === 'Lekarz').map(u => ({ id: u.id, fullName: u.fullName }))
        setDoctorsList(docs)
      } catch {
        // Fallback: extract doctors from visits
        const tempFilter = { page: 1, pageSize: 200 }
        const allVsts = await api.visits.getAll(tempFilter)
        const map = new Map<string, string>()
        allVsts.items.forEach(v => {
          if (v.doctorId && v.doctorFullName) {
            map.set(v.doctorId, v.doctorFullName)
          }
        })
        const docsArr: { id: string; fullName: string }[] = []
        map.forEach((name, id) => {
          docsArr.push({ id, fullName: name })
        })
        setDoctorsList(docsArr)
      }
    } catch (e: any) {
      console.error('Failed to load filter choices', e)
    }
  }

  const loadVisits = async () => {
    setLoading(true)
    setError(null)
    try {
      const start = `${scheduleDate}T00:00:00`
      const end = `${scheduleDate}T23:59:59`
      const filter: any = {
        dateFrom: start,
        dateTo: end,
        page: 1,
        pageSize: 200,
      }

      if (scheduleStatus !== 'All') {
        filter.status = scheduleStatus
      }
      if (scheduleDoctorId !== 'All') {
        filter.doctorId = scheduleDoctorId
      }

      const res = await api.visits.getAll(filter)
      setVisits(res.items)
    } catch (err: any) {
      setError(`Nie udało się pobrać wizyt: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialOptions()
  }, [])

  useEffect(() => {
    loadVisits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleDate, scheduleStatus, scheduleDoctorId])

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      const created = await api.visits.create({
        patientId: parseInt(newVisit.patientId),
        doctorId: newVisit.doctorId,
        scheduledAt: newVisit.scheduledAt,
        notes: newVisit.notes
      })
      setSuccess(`Umówiono wizytę na godzinę ${new Date(created.scheduledAt).toLocaleTimeString('pl-PL', {hour:'2-digit', minute:'2-digit'})}`)
      setShowAddModal(false)
      setNewVisit({
        patientId: '',
        doctorId: '',
        scheduledAt: '',
        notes: '',
      })
      loadVisits()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCancelVisit = async (id: number) => {
    if (!confirm('Czy na pewno chcesz anulować tę wizytę pacjenta?')) return
    setError(null)
    setSuccess(null)
    try {
      await api.visits.cancel(id)
      setSuccess('Wizyta została pomyślnie anulowana.')
      setSelectedVisit(null)
      loadVisits()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDownloadVisitCard = async (visitId: number) => {
    setError(null)
    try {
      const url = await api.visits.getPdfBlobUrl(visitId)
      const link = document.createElement('a')
      link.href = url
      link.download = `karta-wizyty-${visitId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDownloadPrescriptionPdf = async (visitId: number) => {
    setError(null)
    try {
      const url = await api.visits.getPrescriptionPdfBlobUrl(visitId)
      const link = document.createElement('a')
      link.href = url
      link.download = `recepta-${visitId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const changeDate = (days: number) => {
    const d = new Date(scheduleDate)
    d.setDate(d.getDate() + days)
    setScheduleDate(d.toISOString().split('T')[0])
  }

  // Calculated Stats
  const todayVisitsCount = visits.length
  const todayCancelledCount = visits.filter(v => v.status === 'Cancelled').length

  return (
    <div className="tab-pane-two-columns animate-fade">
      {/* Left Column */}
      <div className="list-column" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
        
        {/* Stats Grid */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div className="stat-item" style={{ background: 'var(--background)', padding: '16px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
            <div className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Wizyty na ten dzień</div>
            <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>{todayVisitsCount}</div>
          </div>
          <div className="stat-item" style={{ background: 'var(--background)', padding: '16px', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
            <div className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Anulowane wizyty</div>
            <div className="stat-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--danger)', marginTop: '4px' }}>{todayCancelledCount}</div>
          </div>
        </div>

        {/* Schedule Controls */}
        <div className="schedule-filters-card" style={{ background: 'var(--background)', border: '1px solid var(--surface-border)' }}>
          <div className="filter-group">
            <label style={{ color: 'var(--text-secondary)' }}>Wybierz datę</label>
            <div className="date-picker-row">
              <button className="btn-icon" onClick={() => changeDate(-1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="date-input-field"
                style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
              />
              <button className="btn-icon" onClick={() => changeDate(1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label style={{ color: 'var(--text-secondary)' }}>Status</label>
            <select
              value={scheduleStatus}
              onChange={(e) => setScheduleStatus(e.target.value)}
              className="filter-select"
              style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            >
              <option value="All">Wszystkie statusy</option>
              <option value="Planned">Zaplanowana</option>
              <option value="InProgress">W toku</option>
              <option value="Completed">Zakończona</option>
              <option value="Cancelled">Anulowana</option>
            </select>
          </div>

          <div className="filter-group">
            <label style={{ color: 'var(--text-secondary)' }}>Lekarz</label>
            <select
              value={scheduleDoctorId}
              onChange={(e) => setScheduleDoctorId(e.target.value)}
              className="filter-select"
              style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            >
              <option value="All">Wszyscy lekarze</option>
              {doctorsList.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.fullName}</option>
              ))}
            </select>
          </div>

          <button
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
            style={{ alignSelf: 'flex-end', height: '38px', padding: '0 16px', fontSize: '0.85rem' }}
          >
            + Nowa Wizyta
          </button>
        </div>

        {loading && !selectedVisit && <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><div className="spinner"></div></div>}

        {visits.length === 0 ? (
          <div className="empty-state-box" style={{ background: 'var(--background)', color: 'var(--text-secondary)', border: '1px dashed var(--surface-border)', padding: '30px', textAlign: 'center', borderRadius: '12px' }}>
            Brak wizyt na wybrany dzień dla zdefiniowanych filtrów.
          </div>
        ) : (
          <div className="visits-list">
            {visits.map(v => {
              const vTime = new Date(v.scheduledAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
              return (
                <div
                  key={v.id}
                  className={`visit-row-card ${selectedVisit?.id === v.id ? 'active' : ''} ${v.status.toLowerCase()}`}
                  onClick={() => setSelectedVisit(v)}
                  style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)' }}
                >
                  <div className="visit-time" style={{ color: 'var(--text-primary)' }}>{vTime}</div>
                  <div className="visit-main-info">
                    <span className="visit-patient-name" style={{ color: 'var(--text-primary)' }}>{v.patientFullName}</span>
                    <span className="visit-doctor-name" style={{ color: 'var(--text-secondary)' }}>Lekarz: {v.doctorFullName}</span>
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

      {/* Right Column */}
      <div className="detail-column">
        <Alert message={error} type="error" onClose={() => setError(null)} />
        <Alert message={success} type="success" onClose={() => setSuccess(null)} />

        {selectedVisit ? (
          <div className="detail-card-full" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
            <span className="card-tag">Wybrany Termin</span>
            
            <div className="visit-detail-patient">
              <div className="avatar-large">
                {selectedVisit.patientFullName[0]}
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)' }}>{selectedVisit.patientFullName}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>ID Pacjenta: {selectedVisit.patientId}</p>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label" style={{ color: 'var(--text-muted)' }}>Lekarz prowadzący</span>
                <span className="info-value" style={{ color: 'var(--text-primary)' }}>{selectedVisit.doctorFullName}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ color: 'var(--text-muted)' }}>Data wizyty</span>
                <span className="info-value" style={{ color: 'var(--text-primary)' }}>{new Date(selectedVisit.scheduledAt).toLocaleDateString('pl-PL')}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ color: 'var(--text-muted)' }}>Godzina</span>
                <span className="info-value" style={{ color: 'var(--text-primary)' }}>{new Date(selectedVisit.scheduledAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="info-item">
                <span className="info-label" style={{ color: 'var(--text-muted)' }}>Status rezerwacji</span>
                <span className="info-value">
                  <span className={`status-badge ${selectedVisit.status.toLowerCase()}`}>
                    {selectedVisit.status === 'Planned' ? 'Zaplanowana' :
                     selectedVisit.status === 'InProgress' ? 'W toku' :
                     selectedVisit.status === 'Completed' ? 'Zakończona' : 'Anulowana'}
                  </span>
                </span>
              </div>
            </div>

            {selectedVisit.notes && (
              <div className="visit-notes-display" style={{ background: 'var(--background)', border: '1px solid var(--surface-border)' }}>
                <strong style={{ color: 'var(--primary)' }}>Powód wizyty (notatki):</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{selectedVisit.notes}</p>
              </div>
            )}

            <div className="visit-actions-panel" style={{ marginTop: '25px', display: 'grid', gap: '10px' }}>
              {selectedVisit.status === 'Planned' && (
                <button className="btn-danger w-100" onClick={() => handleCancelVisit(selectedVisit.id)}>
                  Anuluj tę wizytę
                </button>
              )}
              {(selectedVisit.status === 'InProgress' || selectedVisit.status === 'Completed') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button className="btn-secondary w-100" style={{ border: '1px solid var(--primary)', color: 'var(--primary)' }} onClick={() => handleDownloadVisitCard(selectedVisit.id)}>
                    Pobierz Kartę PDF
                  </button>
                  <button className="btn-secondary w-100" style={{ border: '1px solid var(--warning)', color: 'var(--warning)' }} onClick={() => handleDownloadPrescriptionPdf(selectedVisit.id)}>
                    Pobierz Receptę PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="detail-empty-state" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: 'var(--text-muted)' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
              Wybierz zarezerwowaną wizytę z listy po lewej stronie, aby sprawdzić szczegóły lub anulować rezerwację.
            </p>
          </div>
        )}
      </div>

      {/* Add Visit Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Umów nową wizytę lekarską">
        <form onSubmit={handleCreateVisit} className="modal-form-grid-single">
          <label style={{ color: 'var(--text-primary)' }}>
            Wybierz pacjenta
            <select
              required
              value={newVisit.patientId}
              onChange={(e) => setNewVisit({ ...newVisit, patientId: e.target.value })}
              className="modal-select"
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            >
              <option value="">Wybierz pacjenta z kartoteki...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.lastName} {p.firstName} (PESEL: {p.pesel})</option>
              ))}
            </select>
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Wybierz lekarza prowadzącego
            <select
              required
              value={newVisit.doctorId}
              onChange={(e) => setNewVisit({ ...newVisit, doctorId: e.target.value })}
              className="modal-select"
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            >
              <option value="">Wybierz lekarza...</option>
              {doctorsList.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.fullName}</option>
              ))}
            </select>
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Data i godzina wizyty
            <input
              type="datetime-local"
              required
              value={newVisit.scheduledAt}
              onChange={(e) => setNewVisit({ ...newVisit, scheduledAt: e.target.value })}
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
            />
          </label>

          <label style={{ color: 'var(--text-primary)' }}>
            Objawy lub notatki wstępne (opcjonalnie)
            <textarea
              placeholder="np. Ból gardła, gorączka od 2 dni..."
              value={newVisit.notes}
              onChange={(e) => setNewVisit({ ...newVisit, notes: e.target.value })}
              rows={3}
              style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', padding: '8px 12px' }}
            />
          </label>

          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Anuluj</button>
            <button type="submit" className="btn-primary">Rezerwuj termin</button>
          </div>
        </form>
      </Modal>

    </div>
  )
}
