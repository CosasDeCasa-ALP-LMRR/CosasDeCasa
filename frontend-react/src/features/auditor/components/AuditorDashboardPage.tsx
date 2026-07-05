/**
 * @fileoverview Panel de Auditor para revisar perfiles pendientes
 * @author Agustin Parra
 * @date 30/06/2026
 * @requirement RF4: Gestión de Derechos ARCO y Eliminación Segura #19
 */
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Eye, Loader2, Shield, UserCheck, UserX, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
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
  nombre: string;
  correo: string;
  fotoPerfil: string | null;
  biografia: string;
  categoriaPrincipal: string;
  etiquetas: string[];
  estadoVerificacion: string;
  documentos: Documento[];
}

interface SolicitudCancelacion {
  id: string;
  usuario: Usuario;
  justificacion: string;
  fechaSolicitud: string;
}

export function AuditorDashboardPage() {
  const { nombre, fotoPerfil, logout } = useAuth();
  const [perfiles, setPerfiles] = useState<PerfilPendiente[]>([]);
  const [cancelaciones, setCancelaciones] = useState<SolicitudCancelacion[]>([]);
  const [activeTab, setActiveTab] = useState<'perfiles' | 'cancelaciones'>('perfiles');
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
      
      setCancelaciones(prev => prev.filter(c => c.id !== solicitudId));
      alert('Cuenta anonimizada correctamente (Derechos ARCO completados).');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className={styles.center}><Loader2 className="spinner" size={32} /></div>;

  const initials = nombre?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() ?? 'AU';

  return (
    <div className={styles.layout}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        {/* Branding */}
        <div className={styles.sidebarBrand}>
          <div className={styles.brandIcon}>
            <Shield size={22} />
          </div>
          <span className={styles.brandName}>Centro de Auditoría</span>
        </div>

        <div className={styles.sidebarDivider} />

        {/* Auditor Profile */}
        <div className={styles.auditorProfile}>
          {fotoPerfil ? (
            <img src={fotoPerfil} alt="Foto de perfil" className={styles.auditorAvatar} />
          ) : (
            <div className={styles.auditorAvatarFallback}>{initials}</div>
          )}
          <div className={styles.auditorInfo}>
            <span className={styles.auditorName}>{nombre ?? 'Auditor'}</span>
            <span className={styles.auditorRole}>
              <Shield size={12} /> Auditor del Sistema
            </span>
          </div>
        </div>

        <div className={styles.sidebarDivider} />

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          <p className={styles.navSectionLabel}>Tareas Pendientes</p>
          
          <button
            className={`${styles.navItem} ${activeTab === 'perfiles' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('perfiles')}
          >
            <div className={styles.navItemIcon}>
              <UserCheck size={18} />
            </div>
            <div className={styles.navItemContent}>
              <span className={styles.navItemLabel}>Verificar Identidades</span>
              <span className={styles.navItemDesc}>Revisar documentos INE / Cédula</span>
            </div>
            {perfiles.length > 0 && (
              <span className={styles.navBadge}>{perfiles.length}</span>
            )}
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'cancelaciones' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('cancelaciones')}
          >
            <div className={styles.navItemIcon} style={cancelaciones.length > 0 ? { background: 'rgba(239,68,68,0.12)', color: '#dc2626' } : {}}>
              <UserX size={18} />
            </div>
            <div className={styles.navItemContent}>
              <span className={styles.navItemLabel}>Derechos ARCO</span>
              <span className={styles.navItemDesc}>Cancelaciones y eliminación de datos</span>
            </div>
            {cancelaciones.length > 0 && (
              <span className={styles.navBadgeDanger}>{cancelaciones.length}</span>
            )}
          </button>
        </nav>

        {/* Stats Summary */}
        <div className={styles.sidebarStats}>
          <div className={styles.statRow}>
            <span className={styles.statRowLabel}>Perfiles Pendientes</span>
            <span className={styles.statRowValue} style={{ color: perfiles.length > 0 ? '#059669' : 'var(--text-muted)' }}>
              {perfiles.length}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statRowLabel}>Solicitudes ARCO</span>
            <span className={styles.statRowValue} style={{ color: cancelaciones.length > 0 ? '#dc2626' : 'var(--text-muted)' }}>
              {cancelaciones.length}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statRowLabel}>Estado del Sistema</span>
            <span className={`${styles.statBadgeOnline}`}>Activo</span>
          </div>
        </div>

        {/* Logout */}
        <button className={styles.sidebarLogout} onClick={logout}>
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className={styles.mainContent}>
        <header className={styles.contentHeader}>
          <div>
            <h1 className={styles.contentTitle}>
              {activeTab === 'perfiles' ? 'Verificación de Identidades' : 'Solicitudes de Cancelación (ARCO)'}
            </h1>
            <p className={styles.contentSubtitle}>
              {activeTab === 'perfiles'
                ? 'Revisa los documentos de identificación y aprueba o rechaza manualmente los perfiles'
                : 'Gestiona las solicitudes de cancelación y anonimización de cuentas conforme a los Derechos ARCO'}
            </p>
          </div>
        </header>

        {error && <div className={styles.error}><AlertCircle size={18} /> {error}</div>}

        <div className={styles.tabContent}>
          {activeTab === 'perfiles' && (
            <div className={styles.grid}>
              {perfiles.length === 0 ? (
                <div className={styles.empty}>
                  <CheckCircle size={48} strokeWidth={1} />
                  <p>No hay perfiles pendientes</p>
                  <span>Todo está al día. ¡Buen trabajo!</span>
                </div>
              ) : (
                perfiles.map(perfil => (
                  <div key={perfil.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.avatar}>
                        {perfil.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className={styles.cardTitle}>{perfil.nombre}</h3>
                        <span className={styles.cardSubtitle}>{perfil.correo}</span>
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
          )}

          {activeTab === 'cancelaciones' && (
            <div className={styles.grid}>
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
                      <div className={styles.avatar} style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', color: '#dc2626', boxShadow: 'inset 0 0 0 1px #fca5a5' }}>
                        {cancelacion.usuario.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className={styles.cardTitle}>{cancelacion.usuario.nombre}</h3>
                        <span className={styles.cardSubtitle}>{cancelacion.usuario.correo}</span>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <p><strong>Justificación del Usuario:</strong></p>
                      <p className={styles.justificacionText}>"{cancelacion.justificacion}"</p>
                    </div>

                    <div className={styles.cardFooter}>
                      <button
                        className={styles.approveBtn}
                        style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)' }}
                        onClick={() => handleAprobarCancelacion(cancelacion.id)}
                      >
                        <AlertCircle size={16} /> Anonimizar Cuenta
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
