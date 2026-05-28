import '/src/App.css';

export default function Dashboard() {
  return (
    <div className="reception-dashboard">
      <aside className="reception-sidebar">
        <div className="brand">MedicalClinic</div>
        <div className="panel-name">Panel Rejestracji</div>

        <div className="sidebar-section">
          <div className="section-title">Główne</div>
          <nav className="menu">
            <button className="menu-item active">
              <span className="icon-placeholder">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </span>
              Harmonogram
            </button>
            <button className="menu-item">
              <span className="icon-placeholder">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </span>
              Pacjenci
            </button>
            <button className="menu-item">
              <span className="icon-placeholder">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h3L9 3l6 18 3-9h3"></path><path d="M14 10a2 2 0 1 0-4 0v4a2 2 0 1 0 4 0v-4Z"></path><path d="M12 14v4"></path><path d="M12 2v2"></path></svg>
              </span>
              Lekarze
            </button>
          </nav>
        </div>

        <div className="sidebar-section">
          <div className="section-title">Zarządzanie</div>
          <nav className="menu">
            <button className="menu-item">
              <span className="icon-placeholder">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </span>
              Nowa wizyta
            </button>
            <button className="menu-item">
              <span className="icon-placeholder">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 22 7 18.5 2 23.5l1.5-5.5L2 14.5 7 11l3.5 3.5 7-7 3.5 3.5-7 7Z"></path><path d="m14 14 3 3"></path></svg>
              </span>
              Katalog leków
            </button>
            <button className="menu-item">
              <span className="icon-placeholder">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
              </span>
              Raporty
            </button>
          </nav>
        </div>

        <div className="user-footer">
          <div className="footer-avatar">AN</div>
          <div className="user-info">
            Anna Nowak
            <span>Rejestratorka</span>
          </div>
        </div>
      </aside>

      <main className="reception-main">
        <header className="reception-header">
          <div className="header-left">
            <h2>Harmonogram wizyt</h2>
            <div className="date">Środa, 27 maja 2026</div>
          </div>
          <div className="header-actions">
            <button className="nav-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button className="today-btn">Dzisiaj</button>
            <button className="nav-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <button className="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Nowa wizyta
            </button>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="schedule-column">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Wizyty dzisiaj</div>
                <div className="stat-value">
                  18 <span className="stat-badge-neg">3 anulowane</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Oczekujący</div>
                <div className="stat-value">4</div>
              </div>
            </div>

            <div className="schedule-list">
              <div className="schedule-row">
                <div className="time-cell">08:00</div>
                <div className="patient-cell">
                  <div className="p-name">Kowalski Jan</div>
                  <div className="p-pesel">PESEL: 800101567...</div>
                </div>
              </div>

              <div className="schedule-row">
                <div className="time-cell">08:30</div>
                <div className="patient-cell">
                  <div className="p-name">Wiśniewska Anna</div>
                  <div className="p-pesel">PESEL: 920512432...</div>
                </div>
              </div>

              <div className="current-time-marker">
                <div className="marker-line" />
                <div className="marker-dot" />
                <div className="marker-label">Aktualna godzina — 12:15</div>
              </div>

              <div className="schedule-row" style={{ opacity: 0.5 }}>
                <div className="time-cell">12:15</div>
                <div className="patient-cell">
                  <div className="p-name">Zielińska Maria</div>
                  <div className="p-pesel">PESEL: 751208456...</div>
                </div>
              </div>
            </div>
          </div>

          <aside className="details-column">
            <div className="search-box">
              <label>Szukaj pacjenta</label>
              <div className="search-input-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  type="text"
                  className="search-input login-form input"
                  placeholder="Nazwisko lub PESEL..."
                />
              </div>
            </div>

            <div className="detail-card">
              <span className="card-header">Szczegóły wizyty</span>
              <div className="patient-header">
                <div className="avatar-large">ZM</div>
                <div className="p-details">
                  <div className="name">Zielińska Maria</div>
                  <div className="pesel">PESEL: 7512084567</div>
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Lekarz</div>
                  <div className="info-value">dr Marek Kowal</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Specjalizacja</div>
                  <div className="info-value">Internista</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Gabinet</div>
                  <div className="info-value">Nr 3 / II piętro</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Godzina</div>
                  <div className="info-value">12:15</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Status</div>
                  <div className="info-value">
                    <span className="status-badge in-progress">W trakcie</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Nr ubezpieczenia</div>
                  <div className="info-value">NFZ-0001234</div>
                </div>
              </div>

              <div className="p-waiting">
                <span className="card-header">Poczekalnia</span>
                <div className="waiting-list">
                  <div className="waiting-item">
                    <span className="w-name">1. Lewandowski T.</span>
                    <span className="w-time">13:00 · Gab. 5</span>
                  </div>
                  <div className="waiting-item">
                    <span className="w-name">2. Dąbrowska K.</span>
                    <span className="w-time">13:30 · Gab. 3</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}


