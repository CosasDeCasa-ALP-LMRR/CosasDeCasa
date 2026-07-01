/**
 * @fileoverview Panel de Auditor para revisar perfiles pendientes
 * @author Agustin Parra
 * @date 30/06/2026
 * @requirement RF4: Gestión de Derechos ARCO y Eliminación Segura #19
 */
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Eye, Loader2 } from 'lucide-react';
import styles from './AuditorDashboardPage.module.css';

interface Usuario {
  nombre: string;
  correo: string;
}

interface Documento {
  id: string;
  tipo: string;
  urlArchivo: string;
  fechaSubida: string;
}

interface PerfilPendiente {
  id: string;
  usuario: Usuario;
  categoriaPrincipal: string;
  documentos: Documento[];
  fechaActualizacion: string;
}

interface SolicitudCancelacion {
  id: string;
  usuario: Usuario;
  justificacion: string;
  fechaSolicitud: string;
}

export function AuditorDashboardPage() {
  const [perfiles, setPerfiles] = useState<PerfilPendiente[]>([]);
  const [cancelaciones, setCancelaciones] = useState<SolicitudCancelacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchPendientes(), fetchCancelaciones()]).finally(() => setLoading(false));
  }, []);

  const fetchPendientes = async () => {
    try {
      const res = await fetch('/identity/perfiles/pendientes', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al cargar perfiles pendientes');
      const data = await res.json();
      setPerfiles(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchCancelaciones = async () => {
    try {
      const res = await fetch('/identity/perfiles/cancelaciones/pendientes', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al cargar cancelaciones pendientes');
      const data = await res.json();
      setCancelaciones(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerificar = async (id: string, estado: 'APROBADO' | 'RECHAZADO') => {
    try {
      const res = await fetch(`/identity/perfiles/${id}/verificacion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al verificar perfil');
      // Remover de la lista
      setPerfiles(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Perfil (RF4 - Agustin Parra)
  const handleAprobarCancelacion = async (solicitudId: string) => {
    if (!window.confirm('¿Estás seguro de aprobar esta cancelación? Esto anonimizará los datos del usuario de forma irreversible.')) {
      return;
    }

    try {
      const res = await fetch(`/identity/perfiles/cancelaciones/${solicitudId}/aprobar`, {
        method: 'PATCH',
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Error al aprobar la cancelación');
      
      // Remover la tarjeta de la lista una vez aprobada
      setCancelaciones(prev => prev.filter(c => c.id !== solicitudId));
      alert('Cuenta anonimizada correctamente (Derechos ARCO completados).');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className={styles.center}><Loader2 className="spinner" size={32} /></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Panel de Auditoría</h1>
        <p className={styles.subtitle}>Revisa y aprueba perfiles de profesionales</p>
      </header>

      {error && <div className={styles.error}><AlertCircle size={18} /> {error}</div>}

      <div className={styles.grid}>
        <div style={{ gridColumn: '1 / -1' }}>
          <h2>Perfiles Pendientes de Verificación</h2>
        </div>
        {perfiles.length === 0 ? (
          <div className={styles.empty}>
            <CheckCircle size={48} strokeWidth={1} />
            <p>No hay perfiles pendientes</p>
            <span>Todo está al día.</span>
          </div>
        ) : (
          perfiles.map(perfil => (
            <div key={perfil.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {perfil.usuario.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className={styles.cardTitle}>{perfil.usuario.nombre}</h3>
                  <span className={styles.cardSubtitle}>{perfil.usuario.correo}</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <p><strong>Categoría:</strong> {perfil.categoriaPrincipal || 'No definida'}</p>
                <div className={styles.docsList}>
                  <strong>Documentos ({perfil.documentos.length}):</strong>
                  {perfil.documentos.length === 0 ? <span className={styles.textMuted}>Ninguno subido</span> : null}
                  {perfil.documentos.map(doc => (
                    <a key={doc.id} href={doc.urlArchivo} target="_blank" rel="noreferrer" className={styles.docLink}>
                      <Eye size={14} /> {doc.tipo}
                    </a>
                  ))}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button
                  className={styles.rejectBtn}
                  onClick={() => handleVerificar(perfil.id, 'RECHAZADO')}
                >
                  <XCircle size={16} /> Rechazar
                </button>
                <button
                  className={styles.approveBtn}
                  onClick={() => handleVerificar(perfil.id, 'APROBADO')}
                >
                  <CheckCircle size={16} /> Aprobar
                </button>
              </div>
            </div>
          ))
        )}

        <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
          <h2>Solicitudes de Cancelación de Cuenta</h2>
        </div>
        {cancelaciones.length === 0 ? (
          <div className={styles.empty}>
            <CheckCircle size={48} strokeWidth={1} />
            <p>No hay cancelaciones pendientes</p>
            <span>Todo está al día.</span>
          </div>
        ) : (
          cancelaciones.map(cancelacion => (
            <div key={cancelacion.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar} style={{ backgroundColor: '#ff4d4f' }}>
                  {cancelacion.usuario.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className={styles.cardTitle}>{cancelacion.usuario.nombre}</h3>
                  <span className={styles.cardSubtitle}>{cancelacion.usuario.correo}</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <p><strong>Justificación:</strong></p>
                <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#666' }}>"{cancelacion.justificacion}"</p>
              </div>

              <div className={styles.cardFooter}>
                <button
                  className={styles.approveBtn}
                  // Perfil (RF4 - Agustin Parra)
                  onClick={() => handleAprobarCancelacion(cancelacion.id)}
                >
                  <CheckCircle size={16} /> Aprobar Cancelación
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
