/**
 * @fileoverview Panel de Auditor para revisar perfiles pendientes
 * @date 27/06/2026
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

export function AuditorDashboardPage() {
  const [perfiles, setPerfiles] = useState<PerfilPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendientes();
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
    } finally {
      setLoading(false);
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

  if (loading) return <div className={styles.center}><Loader2 className="spinner" size={32} /></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Panel de Auditoría</h1>
        <p className={styles.subtitle}>Revisa y aprueba perfiles de profesionales</p>
      </header>

      {error && <div className={styles.error}><AlertCircle size={18} /> {error}</div>}

      <div className={styles.grid}>
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
      </div>
    </div>
  );
}
