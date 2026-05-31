import React, { useState, useEffect } from 'react'
import { api, type MedicationListDto } from '../api/api.ts'
import { Alert } from '../components/Alert.tsx'

export const MedicationsCatalog: React.FC = () => {
  const [medications, setMedications] = useState<MedicationListDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredMeds = medications.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (med.description && med.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="tab-pane animate-fade" style={{ border: '1px solid var(--surface-border)', background: 'var(--surface)' }}>
      <Alert message={error} type="error" onClose={() => setError(null)} />
      
      <div className="search-header-row">
        <div className="search-box" style={{ maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Wyszukaj lek po nazwie lub opisie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{ background: 'var(--background)', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}
          />
        </div>
      </div>

      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><div className="spinner"></div></div>}

      {filteredMeds.length === 0 ? (
        <p className="empty-message" style={{ color: 'var(--text-muted)' }}>Brak pasujących leków w katalogu.</p>
      ) : (
        <div className="medication-grid">
          {filteredMeds.map(med => (
            <div key={med.id} className="medication-card" style={{ background: 'var(--background)', border: '1px solid var(--surface-border)' }}>
              <div className="med-header">
                <h4 style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{med.name}</h4>
                <span className="med-price" style={{ color: 'var(--success)' }}>{med.unitPrice.toFixed(2)} zł</span>
              </div>
              <p className="med-desc" style={{ color: 'var(--text-secondary)' }}>{med.description || 'Brak dodatkowego opisu preparatu.'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
