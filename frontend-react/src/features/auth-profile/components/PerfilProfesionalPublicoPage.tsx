/**
 * Vista pública del perfil del profesional (solo lectura) para Clientes/Auditores.
 * Rediseño: Hero compacto + layout de dos columnas (sidebar siempre visible + panel principal).
 * La funcionalidad es idéntica al original.
 */
import { useEffect, useState } from 'react';
import {
  Star, MapPin, Zap, Loader2, Phone, Mail,
  ArrowLeft, User, Folder, ShieldCheck,
  FileText,
} from 'lucide-react';
import { ImageCarousel } from './ImageCarousel';
import { sanitizeText } from '../../../context/sanitize';
import { createSolicitud } from '../services/solicitud.service';
import styles from './PerfilProfesionalPublicoPage.module.css';

type PublicProfileEstado = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

interface DiaHorario {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

interface PublicProfile {
  id: string;
  usuarioId?: string;
  usuario?: {
    nombre?: string;
    correo?: string;
    fotoPerfil?: string | null;
  };
  nombre?: string;
  correo?: string;
  fotoPerfil?: string | null;
  foto?: string | null;
  foto_url?: string | null;
  urlFotoPerfil?: string | null;
  telefono: string;
  biografia: string;
  categoriaPrincipal: string;
  etiquetas: string[];
  codigoPostal: string | null;
  municipio: string | null;
  estadoRep: string | null;
  aceptaUrgencias: boolean;
  estadoVerificacion: PublicProfileEstado;
  promedioCalificacion: number;
  diasYHorarios: DiaHorario[] | null;
  documentos: Array<{ id: string; tipo: string; urlArchivo: string }>;
}

function getProfileId(): string | null {
  const match = window.location.pathname.match(/^\/perfil\/(.+)/);
  return match ? match[1] : null;
}

const DIA_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const formatHora = (hora: string) => {
  const [h, m] = hora.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${m} ${ampm}`;
};

/** Iniciales para el avatar fallback */
function initials(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Pill de verificación con color semántico */
function VerifPill({ estado }: { estado: PublicProfileEstado }) {
  const map: Record<PublicProfileEstado, { cls: string; label: string }> = {
    APROBADO: { cls: styles.verifAprobado, label: 'Verificado' },
    PENDIENTE: { cls: styles.verifPendiente, label: 'En revisión' },
    RECHAZADO: { cls: styles.verifRechazado, label: 'No verificado' },
  };
  const { cls, label } = map[estado] ?? map.PENDIENTE;
  return (
    <span className={`${styles.verifPill} ${cls}`}>
      <ShieldCheck size={13} />
      {label}
    </span>
  );
}

export function PerfilProfesionalPublicoPage() {
  const profileId = getProfileId();
  const [perfil, setPerfil] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) return;
    const fetchPerfil = async () => {
      try {
        const res = await fetch(`/identity/perfiles/${profileId}`, { credentials: 'include' });
        if (!res.ok) throw new Error('No se pudo cargar el perfil del profesional');
        setPerfil(await res.json());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    fetchPerfil();
  }, [profileId]);

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

  /* ── Derived data ── */
  const fotoPerfil =
    perfil.usuario?.fotoPerfil ?? perfil.fotoPerfil ?? perfil.foto ?? perfil.foto_url ?? perfil.urlFotoPerfil;
  const nombreProfesional = perfil.usuario?.nombre ?? perfil.nombre ?? 'Profesional';
  const correoProfesional = perfil.usuario?.correo ?? perfil.correo ?? '';

  const portfolioDocs = (perfil.documentos ?? []).filter((d) => d.tipo === 'PORTAFOLIO');
  const portfolioImgs = portfolioDocs.map((d) => d.urlArchivo).filter((u) =>
    ['jpg', 'jpeg', 'png', 'gif', 'webp'].some((ext) => u.toLowerCase().endsWith(ext))
  );
  const portfolioPdfs = portfolioDocs.map((d) => d.urlArchivo).filter((u) =>
    u.toLowerCase().endsWith('.pdf')
  );

  const horariosOrdenados = (perfil.diasYHorarios ?? [])
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
              {fotoPerfil ? (
                <img
                  src={fotoPerfil}
                  alt={`Foto de ${nombreProfesional}`}
                  className={styles.avatarImage}
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
                {perfil.promedioCalificacion.toFixed(1)}
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
              {perfil.telefono && (
                <span className={styles.metaItem}>
                  <Phone size={13} />
                  {perfil.telefono}
                </span>
              )}
              {correoProfesional && (
                <span className={styles.metaItem}>
                  <Mail size={13} />
                  {correoProfesional}
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className={styles.ctaCol}>
            {correoProfesional && (
              <button
                type="button"
                className={styles.contactBtn}
                onClick={async () => {
                  try {
                    await createSolicitud({
                      profesionalId: perfil?.usuarioId ?? profileId ?? '',
                      descripcion: 'El cliente ha enviado una solicitud desde CosasDeCasa.',
                      esUrgencia: false,
                    });
                    window.location.href = `mailto:${correoProfesional}?subject=Solicitud de servicio - CosasDeCasa`;
                  } catch (err: unknown) {
                    console.error(err);
                    alert('No se pudo crear la solicitud. Inicia sesión como cliente y vuelve a intentar.');
                  }
                }}
              >
                <Mail size={15} />
                Contactar
              </button>
            )}
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

          {/* Verificación */}
          <div className={styles.sidebarSection}>
            <p className={styles.sidebarLabel}>Verificación</p>
            <VerifPill estado={perfil.estadoVerificacion} />
          </div>

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
          {perfil.etiquetas.length > 0 && (
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

        </div>
      </div>
    </div>
  );
}