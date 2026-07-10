/**
 * @fileoverview Modal para que el cliente envíe una solicitud de servicio a un profesional.
 * @author Luis Manuel
 * @date 07/07/2026 | updated 09/07/2026 (RF9: añadir telefonoCliente)
 * @requirement RF9: Gestión de Solicitudes y Contacto Directo
 */

import { useState } from 'react';
import { X, Send, Zap, CheckCircle, Loader2, Phone } from 'lucide-react';
import { createSolicitud } from '../../auth-profile/services/solicitud.service';
import { sanitizeText, isSuspiciousText } from '../../../context/sanitize';
import styles from './SolicitudModal.module.css';
import type { ProfesionalCard } from '../../auth-profile/types/perfil.types';

interface SolicitudModalProps {
  profesional: ProfesionalCard;
  onClose: () => void;
}

function getInitials(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

type ModalStep = 'form' | 'loading' | 'success' | 'error';

export function SolicitudModal({ profesional, onClose }: SolicitudModalProps) {
  const [descripcion, setDescripcion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [esUrgencia, setEsUrgencia] = useState(false);
  const [step, setStep] = useState<ModalStep>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [descError, setDescError] = useState('');
  const [telError, setTelError] = useState('');

  const validateTelefono = (value: string): boolean => {
    if (!value.trim()) return true; // opcional
    return /^\+?[1-9]\d{6,14}$/.test(value.replace(/\s/g, ''));
  };

  const handleSubmit = async () => {
    let valid = true;

    if (!descripcion.trim()) {
      setDescError('Por favor describe brevemente lo que necesitas.');
      valid = false;
    }
    if (isSuspiciousText(descripcion)) {
      setDescError('La descripción contiene caracteres no permitidos.');
      valid = false;
    }
    if (telefono && !validateTelefono(telefono)) {
      setTelError('Ingresa un número válido (ej. +524151234567).');
      valid = false;
    }
    if (!valid) return;

    setStep('loading');
    try {
      await createSolicitud({
        profesionalId: profesional.usuarioId || profesional.id,
        descripcion: sanitizeText(descripcion, 500),
        esUrgencia,
        telefonoCliente: telefono.trim().replace(/\s/g, '') || undefined,
      });
      setStep('success');
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.message ||
        'No se pudo enviar la solicitud. Verifica que estés autenticado.';
      setErrorMsg(msg);
      setStep('error');
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Send size={22} />
          </div>
          <div className={styles.titleBlock}>
            <h2 className={styles.title}>Enviar solicitud</h2>
            <p className={styles.subtitle}>
              {step === 'success' ? '¡Tu solicitud fue enviada!' : 'Cuéntale al profesional qué necesitas'}
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* ── Profesional pill ── */}
        <div className={styles.profPill}>
          <div className={styles.profAvatar}>
            {profesional.fotoPerfil ? (
              <img src={profesional.fotoPerfil} alt={profesional.nombre}
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : getInitials(profesional.nombre)}
          </div>
          <div>
            <div className={styles.profName}>{profesional.nombre}</div>
            <div className={styles.profCat}>{profesional.categoriaPrincipal || 'Servicios generales'}</div>
          </div>
        </div>

        {/* ── Step: Form ── */}
        {step === 'form' && (
          <>
            {/* Descripción del problema */}
            <label className={styles.fieldLabel} htmlFor="sol-desc">
              ¿Qué necesitas? <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <textarea
              id="sol-desc"
              className={styles.textarea}
              placeholder="Describe el problema o lo que necesitas. Ej: Tengo una fuga en el baño, necesito que la reparen lo antes posible..."
              maxLength={500}
              value={descripcion}
              onChange={(e) => {
                const v = e.target.value;
                if (isSuspiciousText(v)) {
                  setDescError('La descripción contiene caracteres no permitidos.');
                } else {
                  setDescError('');
                  setDescripcion(v);
                }
              }}
            />
            {descError && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4 }}>{descError}</p>}

            {/* Teléfono de contacto */}
            <label
              className={styles.fieldLabel}
              htmlFor="sol-tel"
              style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Phone size={13} />
              Tu número de WhatsApp
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>(opcional pero recomendado)</span>
            </label>
            <input
              id="sol-tel"
              type="tel"
              className={styles.textarea}
              style={{ minHeight: 'unset', padding: '10px 14px', resize: 'none' }}
              placeholder="+52 415 123 4567"
              maxLength={20}
              value={telefono}
              onChange={(e) => {
                setTelError('');
                setTelefono(e.target.value);
              }}
            />
            {telError && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: 4 }}>{telError}</p>}
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 4, marginBottom: 0 }}>
              Si lo proporcionas, el profesional podrá contactarte directamente por WhatsApp al aceptar tu solicitud.
            </p>

            {/* Urgencia */}
            <label className={styles.urgenciaRow} style={{ marginTop: 14 }}>
              <input
                type="checkbox"
                className={styles.urgenciaCheckbox}
                checked={esUrgencia}
                onChange={(e) => setEsUrgencia(e.target.checked)}
              />
              <span className={styles.urgenciaLabel}>Es una urgencia</span>
              {esUrgencia && (
                <span className={styles.urgenciaBadge}>
                  <Zap size={11} fill="currentColor" /> Urgente
                </span>
              )}
            </label>

            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
              <button className={styles.submitBtn} onClick={handleSubmit}>
                <Send size={15} />
                Enviar solicitud
              </button>
            </div>
          </>
        )}

        {/* ── Step: Loading ── */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
            <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.88rem' }}>Enviando solicitud...</p>
          </div>
        )}

        {/* ── Step: Success ── */}
        {step === 'success' && (
          <div className={styles.successWrap}>
            <div className={styles.successIcon}>
              <CheckCircle size={28} />
            </div>
            <h3 className={styles.successTitle}>¡Solicitud enviada!</h3>
            <p className={styles.successDesc}>
              El profesional recibirá tu solicitud y podrá contactarte directamente por WhatsApp
              al aceptarla. ¡Pronto estarás en contacto!
            </p>
            <button className={styles.closeSuccessBtn} onClick={onClose}>Entendido</button>
          </div>
        )}

        {/* ── Step: Error ── */}
        {step === 'error' && (
          <div className={styles.successWrap}>
            <div className={styles.successIcon} style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
              <X size={28} />
            </div>
            <h3 className={styles.successTitle}>No se pudo enviar</h3>
            <p className={styles.successDesc}>{errorMsg}</p>
            <div className={styles.actions} style={{ justifyContent: 'center' }}>
              <button className={styles.cancelBtn} onClick={onClose}>Cerrar</button>
              <button className={styles.submitBtn} onClick={() => setStep('form')}>
                Reintentar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
