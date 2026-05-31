import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.tsx'
import { Sidebar } from '../components/Sidebar.tsx'
import { Header } from '../components/Header.tsx'

// Panel Imports
import { AdminPanel } from './AdminPanel.tsx'
import { PatientList } from './PatientList.tsx'
import { ReceptionPanel } from './ReceptionPanel.tsx'
import { DoctorPanel } from './DoctorPanel.tsx'
import { MedicationsCatalog } from './MedicationsCatalog.tsx'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('')

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/login')
      return
    }

    // Set default active tab based on role
    if (user.role === 'Admin') {
      setActiveTab('users')
    } else {
      setActiveTab('schedule')
    }
  }, [user, loading, navigate])

  if (loading || !activeTab) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: 'var(--background)' }}>
        <div className="spinner" style={{ width: '50px', height: '50px' }}></div>
      </div>
    )
  }

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'users': return 'Zarządzanie kontami personelu'
      case 'patients': return 'Kartoteka pacjentów'
      case 'schedule': return user?.role === 'Lekarz' ? 'Mój plan przyjęć pacjentów' : 'Harmonogram wizyt lekarskich'
      case 'medications': return 'Katalog leków i preparatów medycznych'
      default: return 'Panel medyczny'
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <AdminPanel />
      case 'patients':
        return <PatientList />
      case 'schedule':
        return user?.role === 'Lekarz' ? <DoctorPanel /> : <ReceptionPanel />
      case 'medications':
        return <MedicationsCatalog />
      default:
        return null
    }
  }

  return (
    <div className="reception-dashboard" style={{ background: 'var(--background)' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="reception-main" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflowY: 'auto' }}>
        <Header title={getHeaderTitle()} />
        <div className="dashboard-content" style={{ marginTop: '20px', flexGrow: 1 }}>
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
