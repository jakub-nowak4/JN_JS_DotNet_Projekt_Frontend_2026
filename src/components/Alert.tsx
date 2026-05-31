import React, { useEffect } from 'react'

interface AlertProps {
  message: string | null
  type: 'success' | 'error'
  onClose: () => void
  autoCloseMs?: number
}

export const Alert: React.FC<AlertProps> = ({ message, type, onClose, autoCloseMs = 5000 }) => {
  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      onClose()
    }, autoCloseMs)

    return () => clearTimeout(timer)
  }, [message, autoCloseMs, onClose])

  if (!message) return null

  return (
    <div className={`alert-message ${type}-alert animate-fade`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0' }}>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: '1.2rem',
          fontWeight: '700',
          cursor: 'pointer',
          color: 'inherit',
          lineHeight: '1',
          marginLeft: '15px'
        }}
        title="Zamknij"
      >
        &times;
      </button>
    </div>
  )
}
