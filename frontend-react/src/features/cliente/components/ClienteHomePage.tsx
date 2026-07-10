import { useEffect, useState } from 'react';
import {
  Search, Star, MapPin, Loader2, Zap,
  Droplets, Bolt, PaintBucket, Trees, Sparkles, Hammer,
  Trash2
} from 'lucide-react';
import { sanitizeText, isSuspiciousText } from '../../../context/sanitize';
import styles from './ClienteHomePage.module.css';
import { cancelAccount } from '../../auth-profile/services/perfil.service';
import { CancelAccountModal } from '../../auth-profile/components/CancelAccountModal';
import { logout } from '../../auth-profile/services/auth.service';
import { searchProfesionales } from '../../search-review/services/search.service';
import { SolicitudModal } from './SolicitudModal';
import type { ProfesionalCard } from '../../auth-profile/types/perfil.types';

const CATEGORIAS = [
  { label: 'Plomería', icon: <Droplets size={20} /> },
  { label: 'Electricidad', icon: <Bolt size={20} /> },
  { label: 'Pintura', icon: <PaintBucket size={20} /> },
  { label: 'Jardinería', icon: <Trees size={20} /> },
  { label: 'Limpieza', icon: <Sparkles size={20} /> },
  { label: 'Carpintería', icon: <Hammer size={20} /> },
];

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function ClienteHomePage() {
  const [profesionales, setProfesionales] = useState<ProfesionalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

  // Estados para Eliminación de Cuenta
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isLoadingCancel, setIsLoadingCancel] = useState(false);

  // Estado para el modal de solicitud
  const [selectedProfesional, setSelectedProfesional] = useState<ProfesionalCard | null>(null);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      searchProfesionales({
        q: searchTerm || undefined,
        category: categoriaActiva || undefined,
      })
        .then((data) => setProfesionales(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, categoriaActiva]);

  const handleVerPerfil = (id: string) => {
    window.history.pushState({}, '', `/perfil/${id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleContact = (prof: ProfesionalCard) => {
    setSelectedProfesional(prof);
  };

  const handleCancelAccount = async (justificacion: string) => {
    setIsLoadingCancel(true);
    try {
      await cancelAccount(justificacion);
      setIsCancelModalOpen(false);
      alert('Solicitud enviada. Los documentos sensibles han sido eliminados. Tu cuenta ahora está en revisión y se cerrará la sesión.');
      await logout();
      window.location.href = '/';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Ocurrió un error al intentar eliminar la cuenta.');
    } finally {
      setIsLoadingCancel(false);
    }
  };

  return (
    <div className={styles.page}>

      {/* ══════════════════════════════════
          HERO
          ══════════════════════════════════ */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>

          <div className={styles.heroEyebrow}>
            <Zap size={13} fill="currentColor" />
            Profesionales verificados
          </div>

          <h1 className={styles.heroTitle}>
            Encuentra al experto que tu hogar{' '}
            <span className={styles.heroTitleAccent}>necesita</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Conecta con profesionales de confianza cerca de ti.
            Calificados, verificados y listos para ayudarte.
          </p>

          <div className={styles.searchRow}>
            <div className={styles.searchWrap}>
              <Search size={18} className={styles.searchIcon} aria-hidden="true" />
              <input
                type="text"
                className={[styles.searchInput, searchError ? styles.inputError : ''].join(' ')}
                placeholder="¿Qué necesitas? Ej. plomería, pintura..."
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isSuspiciousText(value)) {
                    setSearchError('No se permiten etiquetas ni caracteres sospechosos en la búsqueda.');
                    setSearchTerm('');
                  } else {
                    setSearchError(null);
                    setSearchTerm(sanitizeText(value, 100));
                  }
                  setCategoriaActiva(null);
                }}
              />
            </div>
            <button className={styles.searchBtn} disabled={!!searchError}>Buscar</button>
          </div>
          {searchError && <p className={styles.searchError}>{searchError}</p>}

          <div className={styles.heroStats}>
            <div className={styles.hStat}>
              <div className={styles.hStatNum}>{profesionales.length || '400'}+</div>
              <div className={styles.hStatLbl}>Profesionales</div>
            </div>
            <div className={styles.hStat}>
              <div className={styles.hStatNum}>4.8★</div>
              <div className={styles.hStatLbl}>Calificación media</div>
            </div>
            <div className={styles.hStat}>
              <div className={styles.hStatNum}>12</div>
              <div className={styles.hStatLbl}>Categorías</div>
            </div>
          </div>

        </div>
      </header>

      {/* ══════════════════════════════════
          CATEGORÍAS
          ══════════════════════════════════ */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Explorar por categoría</h2>
          {categoriaActiva && (
            <button
              className={styles.sectionLink}
              onClick={() => setCategoriaActiva(null)}
            >
              Limpiar filtro ×
            </button>
          )}
        </div>

        <div className={styles.catGrid}>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.label}
              className={styles.catChip}
              onClick={() =>
                setCategoriaActiva((prev) =>
                  prev === cat.label ? null : cat.label
                )
              }
              style={
                categoriaActiva === cat.label
                  ? {
                    borderColor: 'var(--accent)',
                    background: 'var(--accent-bg)',
                  }
                  : undefined
              }
            >
              <span className={styles.catChipIcon}>{cat.icon}</span>
              <span className={styles.catChipLabel}>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          GRID DE PROFESIONALES
          ══════════════════════════════════ */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            {categoriaActiva
              ? `Profesionales en ${categoriaActiva}`
              : 'Profesionales destacados'}
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {profesionales.length} resultado{profesionales.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className={styles.grid}>
          {loading ? (
            <div className={styles.center} style={{ gridColumn: '1 / -1', padding: '40px' }}>
              <Loader2 size={32} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (!Array.isArray(profesionales) || profesionales.length === 0) ? (
            <div className={styles.empty}>
              No se encontraron profesionales con esa búsqueda.
            </div>
          ) : (
            profesionales.map((prof) => (
              <article
                key={prof.id}
                className={styles.card}
                onClick={() => handleVerPerfil(prof.id)}
              >
                <div className={styles.cardBar} />

                <div className={styles.cardBody}>
                  {/* Header */}
                  <div className={styles.cardTop}>
                    <div className={styles.avatar}>
                      {prof.fotoPerfil ? (
                        <>
                          <img
                            src={prof.fotoPerfil}
                            alt={prof.nombre}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              // Hide broken image and fallback to initials
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerText = getInitials(prof.nombre);
                            }}
                          />
                        </>
                      ) : (
                        getInitials(prof.nombre)
                      )}
                    </div>
                    <div>
                      <h3 className={styles.cardTitle}>{prof.nombre}</h3>
                      <p className={styles.cardCategory}>
                        {prof.categoriaPrincipal || 'Servicios generales'}
                      </p>
                    </div>
                  </div>

                  {/* Rating + location */}
                  <div className={styles.cardMeta}>
                    <span className={styles.rating}>
                      <Star size={14} fill="var(--warning-color)" color="var(--warning-color)" />
                      {prof.promedioCalificacion > 0
                        ? prof.promedioCalificacion.toFixed(1)
                        : 'Nuevo'}
                    </span>
                    {prof.municipio && prof.estadoRep && (
                      <span className={styles.location}>
                        <MapPin size={13} />
                        {prof.municipio}, {prof.estadoRep}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  <div className={styles.tags}>
                    {prof.etiquetas.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                    {prof.etiquetas.length > 3 && (
                      <span className={styles.tag}>+{prof.etiquetas.length - 3}</span>
                    )}
                  </div>

                  {/* CTA */}
                  <div className={styles.cardButtons}>
                    <button
                      className={styles.contactBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerPerfil(prof.id);
                      }}
                    >
                      Ver perfil
                    </button>
                    <button
                      className={styles.contactBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContact(prof);
                      }}
                    >
                      Contactar
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <footer className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3>Cosas <span>de</span> Casa</h3>
            <p>Conectamos profesionales verificados con quienes los necesitan de forma rápida, segura y sin complicaciones.</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Soporte</h4>
            </div>
            <div className={styles.footerColumn}>
              <h4>Plataforma</h4>
            </div>
            <div className={styles.footerColumn}>
              <h4>Seguridad</h4>
              <button
                className={styles.btnDangerGhost}
                onClick={() => setIsCancelModalOpen(true)}
                style={{ padding: '8px 12px', justifyContent: 'flex-start', marginTop: '4px' }}
              >
                <Trash2 size={16} />
                Eliminar mi cuenta
              </button>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Cosas de Casa. Todos los derechos reservados.</p>
          <p>Hecho con ❤️ para tu hogar</p>
        </div>
      </footer>

      {isCancelModalOpen && (
        <CancelAccountModal
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleCancelAccount}
          isLoading={isLoadingCancel}
        />
      )}

      {selectedProfesional && (
        <SolicitudModal
          profesional={selectedProfesional}
          onClose={() => setSelectedProfesional(null)}
        />
      )}

    </div>
  );
}