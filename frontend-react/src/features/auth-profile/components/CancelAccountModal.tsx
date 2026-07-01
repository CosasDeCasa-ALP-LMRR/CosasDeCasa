/**
 * @fileoverview Modal para cancelar la cuenta del profesional (Derechos ARCO)
 * @author Agustin Parra
 * @date 30/06/2026
 * @requirement RF4: Gestión de Derechos ARCO y Eliminación Segura #19
 */
// Perfil (RF4 - Agustin Parra)
import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';
import styles from './CancelAccountModal.module.css';

interface CancelAccountModalProps {
  onClose: () => void;
  onConfirm: (justificacion: string) => Promise<void>;
  isLoading: boolean;
}

export function CancelAccountModal({ onClose, onConfirm, isLoading }: CancelAccountModalProps) {
  const [justificacion, setJustificacion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificacion.trim()) return;
    await onConfirm(justificacion);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <button type="button" className={styles.closeBtn} onClick={onClose} disabled={isLoading} aria-label="Cerrar">
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <AlertTriangle size={28} className={styles.alertIcon} />
          </div>
          <h2 className={styles.title}>Eliminar Cuenta</h2>
        </div>

        <div className={styles.body}>
          
          <div className={styles.warningBanner}>
            <ShieldAlert size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p className={styles.warningText}>
              Al proceder, ejercerás tu <strong>derecho ARCO de cancelación</strong>. 
              Tus documentos sensibles (INE, Cédula) serán destruidos inmediatamente. Tu cuenta será ocultada y pasará a revisión para su anonimización final.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="justificacion">Carta de Motivos (Requerido)</label>
              <textarea
                id="justificacion"
                value={justificacion}
                onChange={(e) => setJustificacion(e.target.value)}
                placeholder="Por favor, explícanos brevemente por qué deseas eliminar tu cuenta en CosasDeCasa..."
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.actions}>
              <button 
                type="button" 
                className={styles.btnCancel} 
                onClick={onClose} 
                disabled={isLoading}
              >
                Mantener mi cuenta
              </button>
              <button 
                type="submit" 
                className={styles.btnConfirm} 
                disabled={!justificacion.trim() || isLoading}
              >
                {isLoading ? 'Procesando...' : 'Confirmar Eliminación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
