import React, { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: string
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop animate-fade" onClick={handleBackdropClick}>
      <div className="modal-content-card animate-slide-up" style={{ position: 'relative', border: '1px solid var(--surface-border)', background: 'var(--surface)', width: width }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          title="Zamknij"
        >
          &times;
        </button>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>{title}</h3>
        {children}
      </div>
    </div>
  )
}
