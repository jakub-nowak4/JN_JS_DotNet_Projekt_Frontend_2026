import React from 'react'
import { useAuth } from '../context/AuthContext.tsx'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth()

  if (!user) return null

  const getRoleLabel = () => {
    switch (user.role) {
      case 'Admin': return 'Panel Admina'
      case 'Lekarz': return 'Panel Lekarza'
      case 'Rejestratorka': return 'Panel Rejestracji'
      default: return 'Panel Medyczny'
    }
  }

  const getInitials = () => {
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
  }

  // Icons Helper
  const getIcon = (type: string) => {
    switch (type) {
      case 'users':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      case 'schedule':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )
      case 'patients':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        )
      case 'medications':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10.5 22 7.5-7.5-4.5-4.5L6 17.5 10.5 22Z" />
            <path d="m14 14 3-3" />
            <circle cx="6" cy="6" r="3" />
            <path d="M9.5 9.5 13 13" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <aside className="reception-sidebar animate-fade">
      <div className="brand">MedicalClinic</div>
      <div className="panel-name">{getRoleLabel()}</div>

      <div className="sidebar-section">
        <div className="section-title">Główne</div>
        <nav className="menu">
          {user.role === 'Admin' && (
            <button
              className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="menu-icon-wrapper" style={{ marginRight: '12px', display: 'flex' }}>
                {getIcon('users')}
              </span>
              Użytkownicy
            </button>
          )}

          {(user.role === 'Rejestratorka' || user.role === 'Lekarz' || user.role === 'Admin') && (
            <button
              className={`menu-item ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setActiveTab('schedule')}
            >
              <span className="menu-icon-wrapper" style={{ marginRight: '12px', display: 'flex' }}>
                {getIcon('schedule')}
              </span>
              Harmonogram
            </button>
          )}

          {(user.role === 'Rejestratorka' || user.role === 'Lekarz' || user.role === 'Admin') && (
            <button
              className={`menu-item ${activeTab === 'patients' ? 'active' : ''}`}
              onClick={() => setActiveTab('patients')}
            >
              <span className="menu-icon-wrapper" style={{ marginRight: '12px', display: 'flex' }}>
                {getIcon('patients')}
              </span>
              Pacjenci
            </button>
          )}

          {(user.role === 'Rejestratorka' || user.role === 'Lekarz') && (
            <button
              className={`menu-item ${activeTab === 'medications' ? 'active' : ''}`}
              onClick={() => setActiveTab('medications')}
            >
              <span className="menu-icon-wrapper" style={{ marginRight: '12px', display: 'flex' }}>
                {getIcon('medications')}
              </span>
              Katalog leków
            </button>
          )}
        </nav>
      </div>

      <div className="user-footer" style={{ marginTop: 'auto' }}>
        <div className="footer-avatar">{getInitials()}</div>
        <div className="user-info">
          {user.firstName} {user.lastName}
          <span>{user.role}</span>
        </div>
        <button className="btn-logout" onClick={logout} title="Wyloguj się z systemu">
          Wyloguj
        </button>
      </div>
    </aside>
  )
}
