import { useEffect, useState } from 'react';
import {
  Search, Star, MapPin, Loader2, Zap,
  Droplets, Bolt, PaintBucket, Trees, Sparkles, Hammer,
  Trash2
} from 'lucide-react';
import styles from './ClienteHomePage.module.css';
import { cancelAccount } from '../../auth-profile/services/perfil.service';
import { CancelAccountModal } from '../../auth-profile/components/CancelAccountModal';
import { logout } from '../../auth-profile/services/auth.service';

interface Profesional {
  id: string;
  usuario: { nombre: string; correo: string; fotoPerfil?: string | null };
  categoriaPrincipal: string;
  etiquetas: string[];
  promedioCalificacion: number;
  municipio: string;
  estadoRep: string;
}

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
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

  // Estados para Eliminación de Cuenta
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isLoadingCancel, setIsLoadingCancel] = useState(false);

  useEffect(() => {
    fetch('/identity/perfiles', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then(setProfesionales)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtrados = profesionales.filter((p) => {
    const termMatch =
      !searchTerm ||
      p.usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoriaPrincipal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.etiquetas.some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()));

    const catMatch =
      !categoriaActiva ||
      p.categoriaPrincipal?.toLowerCase().includes(categoriaActiva.toLowerCase());

    return termMatch && catMatch;
  });

  const handleVerPerfil = (id: string) => {
    window.history.pushState({}, '', `/perfil/${id}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleCancelAccount = async (justificacion: string) => {
    setIsLoadingCancel(true);
    try {
      await cancelAccount(justificacion);
      setIsCancelModalOpen(false);
      alert('Solicitud enviada. Tu cuenta ahora está en revisión y se cerrará la sesión.');
      await logout();
      window.location.href = '/';
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Ocurrió un error al intentar eliminar la cuenta.');
    } finally {
      setIsLoadingCancel(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.center}>
        <Loader2 size={32} className="spinner" />
      </div>
    );
  }

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
                className={styles.searchInput}
                placeholder="¿Qué necesitas? Ej. plomería, pintura..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCategoriaActiva(null);
                }}
              />
            </div>
            <button className={styles.searchBtn}>Buscar</button>
          </div>

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
            {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className={styles.grid}>
          {filtrados.length === 0 ? (
            <div className={styles.empty}>
              No se encontraron profesionales con esa búsqueda.
            </div>
          ) : (
            filtrados.map((prof) => (
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
                      {prof.usuario.fotoPerfil ? (
                        <img
                          src={prof.usuario.fotoPerfil}
                          alt={prof.usuario.nombre}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        getInitials(prof.usuario.nombre)
                      )}
                    </div>
                    <div>
                      <h3 className={styles.cardTitle}>{prof.usuario.nombre}</h3>
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
                  <button
                    className={styles.contactBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVerPerfil(prof.id);
                    }}
                  >
                    Ver perfil
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>© {new Date().getFullYear()} Cosas de Casa. Todos los derechos reservados.</p>
          <div className={styles.footerActions}>
            <button 
              className={styles.btnDangerGhost}
              onClick={() => setIsCancelModalOpen(true)}
            >
              <Trash2 size={16} />
              Eliminar mi cuenta
            </button>
          </div>
        </div>
      </footer>

      {isCancelModalOpen && (
        <CancelAccountModal 
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleCancelAccount}
          isLoading={isLoadingCancel}
        />
      )}

    </div>
  );
}