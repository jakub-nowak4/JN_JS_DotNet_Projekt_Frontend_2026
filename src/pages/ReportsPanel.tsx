import React, { useState, useEffect } from 'react'
import { api, type CostReportDto, type PatientListDto } from '../api/api.ts'
import { Alert } from '../components/Alert.tsx'

export const ReportsPanel: React.FC = () => {
  const [report, setReport] = useState<CostReportDto | null>(null)
  
  // Filter States
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [patientId, setPatientId] = useState('')

  // Catalog options for filters
  const [patients, setPatients] = useState<PatientListDto[]>([])
  const [doctors, setDoctors] = useState<{ id: string; fullName: string }[]>([])

  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadFilterOptions = async () => {
    try {
      const pts = await api.patients.getAll()
      setPatients(pts)

      const users = await api.admin.getAllUsers()
      const docs = users
        .filter(u => u.role === 'Lekarz')
        .map(u => ({ id: u.id, fullName: u.fullName }))
      setDoctors(docs)
    } catch (err: any) {
      console.error('Failed to load filter options:', err)
    }
  }

  const fetchReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const filters: any = {}
      if (dateFrom) filters.dateFrom = `${dateFrom}T00:00:00`
      if (dateTo) filters.dateTo = `${dateTo}T23:59:59`
      if (doctorId) filters.doctorId = doctorId
      if (patientId) filters.patientId = parseInt(patientId)

      const data = await api.reports.getCosts(filters)
      setReport(data)
    } catch (err: any) {
      setError(`Nie udało się pobrać raportu: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFilterOptions()
    fetchReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    fetchReport()
  }

  const handleResetFilters = () => {
    setDateFrom('')
    setDateTo('')
    setDoctorId('')
    setPatientId('')
    // Trigger reloading with empty filters
    setTimeout(() => {
      setLoading(true)
      api.reports.getCosts({}).then(data => {
        setReport(data)
        setLoading(false)
      }).catch(err => {
        setError(err.message)
        setLoading(false)
      })
    }, 50)
  }

  const handleDownloadPdf = async () => {
    setPdfLoading(true)
    setError(null)
    try {
      const filters: any = {}
      if (dateFrom) filters.dateFrom = `${dateFrom}T00:00:00`
      if (dateTo) filters.dateTo = `${dateTo}T23:59:59`
      if (doctorId) filters.doctorId = doctorId
      if (patientId) filters.patientId = parseInt(patientId)

      const url = await api.reports.getCostsPdfBlobUrl(filters)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `raport-kosztow-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setSuccess('Pomyślnie wygenerowano i pobrano raport PDF.')
    } catch (err: any) {
      setError(`Nie udało się wygenerować PDF: ${err.message}`)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="tab-pane animate-fade" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
      <Alert message={error} type="error" onClose={() => setError(null)} />
      <Alert message={success} type="success" onClose={() => setSuccess(null)} />

      {/* Filter Form */}
      <form onSubmit={handleApplyFilters} className="schedule-filters-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', padding: '20px', borderRadius: '14px', background: 'var(--background)', border: '1px solid var(--surface-border)', marginBottom: '30px' }}>
        <div className="filter-group">
          <label style={{ color: 'var(--text-secondary)' }}>Data od</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="search-input"
            style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
          />
        </div>
        <div className="filter-group">
          <label style={{ color: 'var(--text-secondary)' }}>Data do</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="search-input"
            style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
          />
        </div>
        <div className="filter-group">
          <label style={{ color: 'var(--text-secondary)' }}>Lekarz</label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="filter-select"
            style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', height: '46px', width: '100%', borderRadius: '12px' }}
          >
            <option value="">Wszyscy lekarze</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>{d.fullName}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label style={{ color: 'var(--text-secondary)' }}>Pacjent</label>
          <select
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="filter-select"
            style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)', height: '46px', width: '100%', borderRadius: '12px' }}
          >
            <option value="">Wszyscy pacjenci</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.lastName} {p.firstName} (PESEL: {p.pesel})</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', gridColumn: '1 / -1', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button type="button" className="btn-secondary" onClick={handleResetFilters}>
            Resetuj filtry
          </button>
          <button type="submit" className="btn-primary">
            Filtruj raport
          </button>
          <button type="button" className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)' }} onClick={handleDownloadPdf} disabled={pdfLoading}>
            {pdfLoading ? 'Generowanie...' : 'Generuj PDF'}
          </button>
        </div>
      </form>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner"></div>
        </div>
      )}

      {report && !loading && (
        <div className="animate-fade">
          {/* Stats Summary Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Liczba wizyt</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '5px' }}>{report.totalVisits}</h3>
            </div>
            <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Suma procedur</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '5px' }}>{report.totalProceduresCost.toFixed(2)} zł</h3>
            </div>
            <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '16px', border: '1px solid var(--surface-border)' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Suma recept lekowych</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--warning)', marginTop: '5px' }}>{report.totalMedicationsCost.toFixed(2)} zł</h3>
            </div>
            <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--surface-border)', background: 'var(--primary-light)' }}>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 'bold' }}>Przychód Łączny</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '5px' }}>{report.grandTotal.toFixed(2)} zł</h3>
            </div>
          </div>

          <h4 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '15px' }}>
            Szczegóły transakcji ({report.filterDescription})
          </h4>

          {report.items.length === 0 ? (
            <p className="empty-message" style={{ color: 'var(--text-muted)' }}>Brak zarejestrowanych kosztów wizyt dla podanych kryteriów.</p>
          ) : (
            <div className="table-responsive" style={{ border: '1px solid var(--surface-border)', borderRadius: '12px' }}>
              <table className="data-table">
                <thead>
                  <tr style={{ background: 'var(--background)' }}>
                    <th style={{ color: 'var(--text-secondary)' }}>Termin</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Pacjent</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Lekarz</th>
                    <th style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>Koszty procedur</th>
                    <th style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>Koszty leków</th>
                    <th style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>Razem</th>
                  </tr>
                </thead>
                <tbody>
                  {report.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <td style={{ color: 'var(--text-primary)' }}>
                        <strong>{new Date(item.scheduledAt).toLocaleDateString('pl-PL')}</strong>{' '}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(item.scheduledAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-primary)' }}>{item.patientFullName}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{item.doctorFullName}</td>
                      <td style={{ color: 'var(--text-primary)', textAlign: 'right' }}>
                        {item.proceduresCost.toFixed(2)} zł
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.proceduresCount} zabieg(ów)</div>
                      </td>
                      <td style={{ color: 'var(--text-primary)', textAlign: 'right' }}>
                        {item.medicationsCost.toFixed(2)} zł
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.medicationsCount} lek(ów)</div>
                      </td>
                      <td style={{ color: 'var(--primary)', fontWeight: 'bold', textAlign: 'right' }}>
                        {item.totalCost.toFixed(2)} zł
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
