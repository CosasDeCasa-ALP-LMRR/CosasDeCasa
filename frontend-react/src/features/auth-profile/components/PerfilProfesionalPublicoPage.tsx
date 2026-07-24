/**
 * Vista pública del perfil del profesional (solo lectura) para Clientes/Auditores.
 * Rediseño: Hero compacto + layout de dos columnas (sidebar siempre visible + panel principal).
 * La funcionalidad es idéntica al original.
 */
import { useEffect, useState } from 'react';
import {
  Star, MapPin, Zap, Loader2, Mail,
  ArrowLeft, User, Folder,
  FileText, CheckCircle, AlertCircle
} from 'lucide-react';
import { ImageCarousel } from './ImageCarousel';
import { sanitizeText } from '../../../context/sanitize';
import { getPerfilPublico } from '../services/perfil.service';
import { obtenerResenas, crearResena } from '../../search-review/services/review.service';
import { useAuth } from '../../../context/AuthContext';
import styles from './PerfilProfesionalPublicoPage.module.css';
import type { PerfilPublico } from '../types/perfil.types';
import { SolicitudModal } from '../../cliente/components/SolicitudModal';
import type { Resena } from '../../search-review/services/review.service';

// PerfilPublico type is imported from perfil.types.ts — matches PerfilPublicoResponseDto from backend

function getProfileId(): string | null {
  const match = window.location.pathname.match(/^\/perfil\/(.+)/);
  return match ? match[1] : null;
}

const DIA_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const formatHora = (hora: string) => {
  if (!hora) return '';
  const parts = hora.split(':');
  if (parts.length < 2) return hora;
  const [h, m] = parts;
  const hour = parseInt(h, 10);
  if (isNaN(hour)) return hora;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
};

/** Iniciales para el avatar fallback */
function initials(nombre: string): string {
  if (!nombre) return '';
  return String(nombre)
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}


export function PerfilProfesionalPublicoPage() {
  const profileId = getProfileId();
  const [perfil, setPerfil] = useState<PerfilPublico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auth
  const { role } = useAuth();

  // Review State
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [resenasLoading, setResenasLoading] = useState(true);
  const [reviewScore, setReviewScore] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (!profileId) return;
    const fetchPerfil = async () => {
      try {
        const data = await getPerfilPublico(profileId);
        setPerfil(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [profileId]);

  useEffect(() => {
    if (!perfil?.usuarioId) return;
    const fetchResenas = async () => {
      try {
        const fetchedResenas = await obtenerResenas(perfil.usuarioId);
        setResenas(fetchedResenas);
      } catch {
        // Reviews failing should not break the page
      } finally {
        setResenasLoading(false);
      }
    };
    fetchResenas();
  }, [perfil?.usuarioId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil?.usuarioId || reviewScore === 0) return;

    setSubmittingReview(true);
    try {
      await crearResena(perfil.usuarioId, {
        calificacion: reviewScore,
        comentario: reviewComment || undefined,
      });
      // Refresh reviews
      const updatedResenas = await obtenerResenas(perfil.usuarioId);
      setResenas(updatedResenas);
      // Actualizar el promedio mostrado en UI calculándolo localmente
      const newTotal = updatedResenas.reduce((sum, r) => sum + r.calificacion, 0);
      const newAvg = updatedResenas.length > 0 ? newTotal / updatedResenas.length : 0;
      setPerfil({ ...perfil, promedioCalificacion: newAvg });
      
      setReviewScore(0);
      setReviewComment('');
      showToast('Reseña guardada exitosamente.', 'success');
    } catch (err: unknown) {
      console.error(err);
      showToast('No se pudo enviar la reseña. Intenta más tarde.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 size={36} className={styles.spinnerBig} />
        <p>Cargando perfil del profesional...</p>
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className={styles.errorState}>
        <h2>Error al cargar el perfil</h2>
        <p>{error ?? 'Perfil no encontrado.'}</p>
        <button className={styles.resetBtn} onClick={() => window.history.back()}>
          <ArrowLeft size={14} /> Volver
        </button>
      </div>
    );
  }

  /* ── Derived data — new DTO shape: nombre/fotoPerfil are top-level ── */
  const fotoPerfil = perfil.fotoPerfil;
  const nombreProfesional = perfil.nombre ?? 'Profesional';
  // correo no se expone en vista pública (PerfilPublicoResponseDto no lo incluye)

  const portfolioDocs = (perfil.portafolio ?? []);
  const portfolioImgs = portfolioDocs.map((d) => d.urlArchivo).filter((u) =>
    ['jpg', 'jpeg', 'png', 'gif', 'webp'].some((ext) => (u || '').toLowerCase().endsWith(ext))
  );
  const portfolioPdfs = portfolioDocs.map((d) => d.urlArchivo).filter((u) =>
    (u || '').toLowerCase().endsWith('.pdf')
  );

  const horariosOrdenados = (Array.isArray(perfil.diasYHorarios) ? perfil.diasYHorarios : [])
    .slice()
    .sort((a, b) => DIA_ORDER.indexOf(a.dia) - DIA_ORDER.indexOf(b.dia));

  const totalPortafolio = portfolioImgs.length + portfolioPdfs.length;

  return (
    <div className={styles.page}>

      {/* ── Back ── */}
      <button className={styles.backBtn} onClick={() => window.history.back()}>
        <ArrowLeft size={14} /> Volver al catálogo
      </button>

      {/* ════════════════════════════════
          HERO
          ════════════════════════════════ */}
      <header className={styles.profileHeader}>
        <div className={styles.banner} />

        <div className={styles.headerContent}>

          {/* Avatar */}
          <div className={styles.avatarCol}>
            <div className={styles.avatarWrap}>
              {fotoPerfil && !imgError ? (
                <img
                  src={fotoPerfil}
                  alt={`Foto de ${nombreProfesional}`}
                  className={styles.avatarImage}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className={styles.avatarFallback} aria-hidden="true">
                  <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                    {initials(nombreProfesional)}
                  </span>
                </div>
              )}
              <div className={styles.ratingBadge}>
                <Star size={11} fill="currentColor" />
                {(perfil.promedioCalificacion || 0).toFixed(1)}
              </div>
            </div>
          </div>

          {/* Name + meta */}
          <div className={styles.headerInfo}>
            <h1 className={styles.profileTitle}>{nombreProfesional}</h1>
            {perfil.categoriaPrincipal && (
              <p className={styles.profileCategory}>{perfil.categoriaPrincipal}</p>
            )}
            <div className={styles.profileMeta}>
              {(perfil.municipio || perfil.estadoRep) && (
                <span className={styles.metaItem}>
                  <MapPin size={13} />
                  {perfil.municipio}{perfil.estadoRep ? `, ${perfil.estadoRep}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className={styles.ctaCol}>
            <button
              type="button"
              className={styles.contactBtn}
              onClick={() => setIsModalOpen(true)}
            >
              <Mail size={15} />
              Contactar
            </button>
            {perfil.aceptaUrgencias && (
              <span className={styles.urgenciaBadge}>
                <Zap size={11} fill="currentColor" />
                Acepta urgencias
              </span>
            )}
          </div>

        </div>
      </header>

      {/* ════════════════════════════════
          BODY — sidebar + main
          ════════════════════════════════ */}
      <div className={styles.bodyLayout}>

        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>


          {/* Disponibilidad */}
          <div className={styles.sidebarSection}>
            <p className={styles.sidebarLabel}>Disponibilidad</p>
            {horariosOrdenados.length > 0 ? (
              horariosOrdenados.map((dh) => (
                <div key={dh.dia} className={styles.dayRow}>
                  <span className={styles.dayName}>{dh.dia}</span>
                  <span className={styles.dayTime}>
                    {formatHora(dh.horaInicio)}–{formatHora(dh.horaFin)}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Sin horarios registrados
              </p>
            )}
          </div>

          {/* Especialidades */}
          {(perfil.etiquetas || []).length > 0 && (
            <div className={styles.sidebarSection}>
              <p className={styles.sidebarLabel}>Especialidades</p>
              <div className={styles.tagsWrap}>
                {perfil.etiquetas.map((tag) => (
                  <span key={tag} className={styles.skillTag}>{tag}</span>
                ))}
              </div>
            </div>
          )}

        </aside>

        {/* ── MAIN PANEL ── */}
        <div className={styles.mainPanel}>

          {/* Biografía */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                <User size={15} />
                Sobre el profesional
              </span>
            </div>
            <div className={styles.cardBody}>
              {perfil.biografia ? (
                <p className={styles.bioText}>{sanitizeText(perfil.biografia)}</p>
              ) : (
                <p className={styles.bioEmpty}>Este profesional aún no ha escrito una descripción.</p>
              )}
            </div>
          </div>

          {/* Portafolio */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                <Folder size={15} />
                Portafolio
              </span>
              {totalPortafolio > 0 && (
                <span className={styles.cardBadge}>{totalPortafolio} archivo{totalPortafolio !== 1 ? 's' : ''}</span>
              )}
            </div>
            <div className={styles.cardBody}>

              {totalPortafolio === 0 && (
                <div className={styles.noPortfolio}>
                  <Folder size={28} strokeWidth={1.5} />
                  <p>Aún no hay evidencias en el portafolio.</p>
                </div>
              )}

              {portfolioImgs.length > 0 && (
                <ImageCarousel images={portfolioImgs} />
              )}

              {portfolioPdfs.length > 0 && (
                <div className={styles.pdfList} style={portfolioImgs.length > 0 ? { marginTop: 16 } : undefined}>
                  {portfolioPdfs.map((url, idx) => (
                    <div key={`${url}-${idx}`} className={styles.pdfCard}>
                      <div className={styles.pdfCardHeader}>
                        <span className={styles.pdfTitle}>
                          <FileText size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                          Documento PDF #{idx + 1}
                        </span>
                        <a href={url} target="_blank" rel="noreferrer" className={styles.pdfLink}>
                          Abrir en nueva pestaña
                        </a>
                      </div>
                      <iframe title={`PDF ${idx + 1}`} src={url} className={styles.pdfFrame} />
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* ── Reseñas ── */}
          <div className={`${styles.card} ${styles.reviewsCard}`}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>
                <Star size={15} />
                Reseñas de clientes
              </span>
              <span className={styles.cardBadge}>{(Array.isArray(resenas) ? resenas : []).length} reseñas</span>
            </div>
            <div className={styles.cardBody}>
              {role === 'CLIENTE' && (
                <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
                  <strong>Deja una calificación</strong>
                  <div className={styles.starsInput}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`${styles.starBtn} ${star <= reviewScore ? styles.active : ''}`}
                        onClick={() => setReviewScore(star)}
                      >
                        <Star size={24} fill={star <= reviewScore ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    className={styles.reviewTextarea}
                    placeholder="Cuéntanos tu experiencia (opcional)..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    className={styles.submitReviewBtn}
                    disabled={reviewScore === 0 || submittingReview}
                  >
                    {submittingReview ? 'Enviando...' : 'Enviar reseña'}
                  </button>
                </form>
              )}

              {resenasLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Loader2 size={24} className={styles.spinnerBig} />
                </div>
              ) : (Array.isArray(resenas) ? resenas : []).length === 0 ? (
                <div className={styles.noReviews}>
                  Este profesional aún no tiene reseñas.
                </div>
              ) : (
                <div className={styles.reviewList}>
                  {(Array.isArray(resenas) ? resenas : []).map((resena) => (
                    <div key={resena.id} className={styles.reviewItem}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewAuthor}>
                          {resena?.cliente?.fotoPerfil ? (
                            <img src={resena.cliente.fotoPerfil} alt={resena?.cliente?.nombre} className={styles.reviewAuthorImg} />
                          ) : (
                            <div className={styles.reviewAuthorFallback}>{initials(resena?.cliente?.nombre || '')}</div>
                          )}
                          <div>
                            <div className={styles.reviewAuthorName}>{resena?.cliente?.nombre || 'Usuario'}</div>
                            <div className={styles.reviewDate}>{resena?.fechaCreacion ? new Date(resena.fechaCreacion).toLocaleDateString() : ''}</div>
                          </div>
                        </div>
                        <div className={styles.reviewStars}>
                          {[...Array(Math.max(0, parseInt(String(resena?.calificacion)) || 0))].map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      {resena?.comentario && (
                        <p className={styles.reviewComment}>{sanitizeText(resena.comentario)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── TOAST CONTAINER ── */}
      {toast && (
        <div className={styles.toastContainer}>
          <div className={`${styles.toast} ${styles[toast.type]}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ── Solicitud Modal ── */}
      {isModalOpen && perfil && (
        <SolicitudModal
          profesional={{
            id: perfil.id,
            usuarioId: perfil.usuarioId,
            nombre: perfil.nombre,
            fotoPerfil: perfil.fotoPerfil,
            categoriaPrincipal: perfil.categoriaPrincipal,
            etiquetas: perfil.etiquetas,
            promedioCalificacion: perfil.promedioCalificacion,
            aceptaUrgencias: perfil.aceptaUrgencias,
            municipio: perfil.municipio,
            estadoRep: perfil.estadoRep,
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}