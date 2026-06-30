import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Search,
  Calendar,
  Clock,
  MessageCircle,
  Star,
  Check,
} from 'lucide-react';
import styles from './LandingPublicHomePage.module.css';

import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

type AuthMode = 'login' | 'register';

/* ─── Slides: imágenes de oficios del hogar (Pexels, libres) ─── */
const SLIDES = [
  {
    url: 'https://images.pexels.com/photos/8293700/pexels-photo-8293700.jpeg?auto=compress&cs=tinysrgb&w=1600',
    label: 'Electricista trabajando en el hogar',
  },
  {
    url: 'https://images.pexels.com/photos/5691533/pexels-photo-5691533.jpeg?auto=compress&cs=tinysrgb&w=1600',
    label: 'Plomero reparando tubería',
  },
  {
    url: 'https://images.pexels.com/photos/6195950/pexels-photo-6195950.jpeg?auto=compress&cs=tinysrgb&w=1600',
    label: 'Pintor profesional en interiores',
  },
  {
    url: 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=1600',
    label: 'Técnico instalando aire acondicionado',
  },
];

const INTERVAL_MS = 4500;

/* ─── Logo ─── */
function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <div className={styles.logoMark}>
      <svg
        className={styles.logoHex}
        width={size}
        height={size}
        viewBox="0 0 30 30"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15 2L27 9V21L15 28L3 21V9L15 2Z"
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1"
        />
        <path
          d="M15 8L22 12V18L15 22L8 18V12L15 8Z"
          fill="var(--accent)"
          opacity="0.9"
        />
      </svg>
      <span className={styles.logoName}>
        Cosas<span>de</span>Casa
      </span>
    </div>
  );
}

/* ─── Footer logo (sin texto blanco forzado) ─── */
function FooterLogo() {
  return (
    <div className={styles.footerBrand}>
      <svg
        className={styles.footerLogoHex}
        viewBox="0 0 30 30"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15 2L27 9V21L15 28L3 21V9L15 2Z"
          fill="var(--accent-bg)"
          stroke="var(--accent)"
          strokeWidth="1.2"
        />
        <path d="M15 8L22 12V18L15 22L8 18V12L15 8Z" fill="var(--accent)" />
      </svg>
      <span className={styles.footerName}>
        Cosas<span>de</span>Casa
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════ */
export function LandingPublicHomePage() {
  const [current, setCurrent] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  /* Slideshow auto-advance */
  useEffect(() => {
    const t = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(t);
  }, []);

  /* Steps data */
  const steps = useMemo(
    () => [
      { num: '1', title: 'Publica tu necesidad', desc: 'Describe el servicio que buscas en minutos' },
      { num: '2', title: 'Recibe propuestas', desc: 'Profesionales verificados te contactan con disponibilidad' },
      { num: '3', title: 'Elige al experto', desc: 'Compara reseñas, experiencia y precio antes de confirmar' },
      { num: '4', title: 'Da seguimiento', desc: 'Todo desde la plataforma: chat, agenda y calificación' },
    ],
    []
  );

  /* Pill cards data — 2 columnas de 3 */
  const pillsLeft = useMemo(
    () => [
      { Icon: Search,      title: 'Encuentra al experto ideal',  desc: 'Filtra por categoría, zona y disponibilidad.' },
      { Icon: ShieldCheck, title: 'Perfiles verificados',         desc: 'Validación antes de operar en la plataforma.' },
      { Icon: Star,        title: 'Reseñas reales',               desc: 'Opiniones de clientes verificados.' },
    ],
    []
  );

  const pillsRight = useMemo(
    () => [
      { Icon: MessageCircle, title: 'Chat directo',           desc: 'Coordina sin intermediarios desde la app.' },
      { Icon: Calendar,      title: 'Agenda inteligente',     desc: 'Disponibilidad en tiempo real, sin llamadas.' },
      { Icon: Clock,         title: 'Respuesta en <24 h',     desc: 'Profesionales responden rápido a tu solicitud.' },
    ],
    []
  );

  const highlights = [
    'Registro rápido y gratuito',
    'Profesionales verificados',
    'Disponibilidad en tiempo real',
    'Comunicación directa',
    'Historial de servicios',
  ];

  /* Auth pages */
  if (authMode === 'login') {
    return <LoginPage onGoRegister={() => setAuthMode('register')} />;
  }
  if (authMode === 'register') {
    return <RegisterPage onGoLogin={() => setAuthMode('login')} defaultRole="CLIENTE" />;
  }

  return (
    <>
      <div className={styles.page}>

      {/* ══════════ HERO ══════════ */}
      <header className={styles.hero}>

        {/* Background slides */}
        <div className={styles.slides} aria-hidden="true">
          {SLIDES.map((s, i) => (
            <div
              key={s.url}
              className={[styles.slide, i === current ? styles.slideActive : ''].join(' ')}
              style={{ backgroundImage: `url(${s.url})` }}
              role="img"
              aria-label={s.label}
            />
          ))}
          <div className={styles.overlay} />
        </div>

        <div className={styles.heroBody}>

          {/* Nav */}
          <div className={styles.topBar}>
            <a href="/" className={styles.brandLink} aria-label="Cosas de Casa — inicio">
              <LogoMark />
            </a>
            <div className={styles.authButtons}>
              <button
                className={styles.btnGhost}
                type="button"
                onClick={() => setAuthMode('login')}
              >
                Iniciar sesión
              </button>
              <button
                className={styles.btnPrimary}
                type="button"
                onClick={() => setAuthMode('register')}
              >
                Registrarse
              </button>
            </div>
          </div>

          {/* Center content */}
          <div className={styles.heroCenter}>
            <div className={styles.heroBadge}>
              <div className={styles.badgeDot} />
              Cosas de Casa — Conecta Con Profesionales Verificados
            </div>

            <h1 className={styles.title}>
              Tu hogar,<br />
              <span className={styles.titleAccent}>en buenas manos</span>
            </h1>

            <p className={styles.subtitle}>
              Conectamos profesionales verificados con quienes los necesitan —
              rápido, seguro y sin complicaciones.
            </p>

            <div className={styles.ctaRow}>
              <button
                className={styles.btnHero}
                type="button"
                onClick={() => setAuthMode('register')}
              >
                Empezar ahora
                <ArrowRight size={18} aria-hidden="true" />
              </button>
              <button
                className={styles.btnHeroGhost}
                type="button"
                onClick={() => {
                  document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Ver cómo funciona
              </button>
            </div>
          </div>

          {/* Slide dots */}
          <div className={styles.slideDots}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                className={[styles.dot, i === current ? styles.dotActive : ''].join(' ')}
                onClick={() => setCurrent(i)}
                aria-label={`Cambiar a imagen ${i + 1}`}
              />
            ))}
          </div>

          {/* Stats bar */}
          <div className={styles.statsBar} aria-label="Estadísticas de la plataforma">
            {[
              { value: '+10k', label: 'Servicios gestionados' },
              { value: '+500', label: 'Profesionales activos' },
              { value: '4.8 ★', label: 'Calificación promedio' },
              { value: '<24 h', label: 'Tiempo de respuesta' },
            ].map((s) => (
              <div className={styles.statItem} key={s.label}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ══════════ MAIN ══════════ */}
      <main className={styles.main}>

        {/* ── Pasos ── */}
        <section id="como-funciona" className={styles.stepsSection}>
          <p className={styles.secLabel}>¿Cómo funciona?</p>
          <h2 className={styles.secTitle}>En 4 pasos sencillos</h2>
          <div className={styles.stepsGrid}>
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={styles.stepCard}
              >
                <div className={[styles.stepNum, i === 0 ? styles.stepNumActive : ''].join(' ')}>
                  {s.num}
                </div>
                <div className={styles.stepTitle}>{s.title}</div>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features: pill rows + highlight ── */}
        <section className={styles.featuresSection}>
          <p className={styles.secLabel}>Características</p>
          <h2 className={styles.secTitle}>Todo lo que necesitas</h2>
          <p className={styles.secSub}>
            Una plataforma diseñada para conectar con confianza y sin complicaciones.
          </p>

          <div className={styles.featuresGrid}>

            {/* Col 1 */}
            <div className={styles.pillsCol}>
              {pillsLeft.map(({ Icon, title, desc }) => (
                <div className={styles.pillCard} key={title}>
                  <div className={styles.pillIcon} aria-hidden="true">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className={styles.pillTitle}>{title}</div>
                    <div className={styles.pillDesc}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Col 2 */}
            <div className={styles.pillsCol}>
              {pillsRight.map(({ Icon, title, desc }) => (
                <div className={styles.pillCard} key={title}>
                  <div className={styles.pillIcon} aria-hidden="true">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className={styles.pillTitle}>{title}</div>
                    <div className={styles.pillDesc}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Highlight card */}
            <div className={styles.highlightCard}>
              <span className={styles.hlTag}>¿Por qué elegirnos?</span>
              <h3 className={styles.hlTitle}>Todo en un solo lugar</h3>
              <p className={styles.hlDesc}>
                Agenda, comunícate y da seguimiento sin salir de la plataforma.
              </p>
              <ul className={styles.hlList} aria-label="Ventajas de Cosas de Casa">
                {highlights.map((item) => (
                  <li key={item} className={styles.hlItem}>
                    <div className={styles.hlCheck} aria-hidden="true">
                      <Check size={13} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </section>

        {/* ── CTA Band ── */}
        <div className={styles.ctaBand}>
          <div>
            <h2 className={styles.ctaBandTitle}>¿Listo para comenzar?</h2>
            <p className={styles.ctaBandDesc}>
              Únete a miles de personas que ya confían sus servicios del hogar a Cosas de Casa.
            </p>
          </div>
          <div className={styles.ctaBandBtns}>
            <button
              className={styles.btnOutline}
              type="button"
              onClick={() => setAuthMode('login')}
            >
              Iniciar sesión
            </button>
            <button
              className={styles.btnAccent}
              type="button"
              onClick={() => setAuthMode('register')}
            >
              Crear cuenta gratis
            </button>
          </div>
        </div>

        <div className={styles.avisosLinksContainer}>
          <a href="/aviso-privacidad-simplificado" target="_blank" rel="noreferrer" className={styles.btnAviso}>
            Ver Aviso de Privacidad Simplificado
          </a>
          <span className={styles.separator}>|</span>
          <a href="/aviso-privacidad" target="_blank" rel="noreferrer" className={styles.btnAviso}>
            Ver Aviso de Privacidad Integral
          </a>
        </div>

      </main>

      {/* ══════════ FOOTER ══════════ */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <FooterLogo />
          <nav className={styles.footerLinks} aria-label="Enlaces del pie de página">
            {[
              { href: '/',         label: 'Inicio' },
              { href: '/perfil',   label: 'Profesionales' },
              { href: '#faq',      label: 'FAQ' },
              { href: '/terminos', label: 'Términos' },
            ].map((l) => (
              <a key={l.href} href={l.href} className={styles.footerLink}>
                {l.label}
              </a>
            ))}
          </nav>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} Cosas de Casa. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}