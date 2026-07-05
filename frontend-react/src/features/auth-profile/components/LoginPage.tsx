/**
 * @fileoverview LoginPage — RF1/RF2 professional login
 * @date 27/06/2026
 */
/**
 * @modified 03/07/2026
 * @author César González
 * @requirement Desmitificar la "Seguridad" del FrontEnd
 * @changes Se agregó rate-limiting visual: después de 5 intentos fallidos
 *          el botón de login se bloquea durante 60 segundos con una cuenta
 *          regresiva visible, espejando el @Throttle del backend (5 req/min).
 *          Esto hace visible al usuario que la protección existe en ambas capas.
 */
import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { login } from '../services/auth.service';
import { useAuth } from '../../../context/AuthContext';
import { sanitizeText, isSuspiciousText } from '../../../context/sanitize';
import { AvisoPrivacidadPage } from './AvisoPrivacidadPage';
import styles from './LoginPage.module.css';

interface Props {
  onGoRegister: (defaultRole?: 'PROFESIONAL' | 'CLIENTE') => void;
}

const SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&q=80',
    label: 'Profesional de plomería',
  },
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    label: 'Electricista en trabajo',
  },
  {
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80',
    label: 'Servicio de limpieza',
  },
  {
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
    label: 'Carpintería profesional',
  },
];

const INTERVAL_MS = 4500;

// ── Configuración de rate-limiting visual ──────────────────────────────────────
// Espeja el @Throttle del backend: 5 intentos por 60 segundos.
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;
// ──────────────────────────────────────────────────────────────────────────────

export function LoginPage({ onGoRegister }: Props) {
  const { login: loginCtx } = useAuth();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ correo?: string; password?: string }>({});
  const [current, setCurrent] = useState(0);
  const [showAviso, setShowAviso] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Rate-limiting visual ───────────────────────────────────────────────────
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);
  const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLockedOut = lockoutSecondsLeft > 0;

  const startLockout = useCallback(() => {
    setLockoutSecondsLeft(LOCKOUT_SECONDS);
    lockoutTimerRef.current = setInterval(() => {
      setLockoutSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(lockoutTimerRef.current!);
          lockoutTimerRef.current = null;
          setFailedAttempts(0); // Reset intentos al acabar el bloqueo
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (lockoutTimerRef.current) clearInterval(lockoutTimerRef.current);
    };
  }, []);
  // ──────────────────────────────────────────────────────────────────────────

  const goTo = (index: number) => {
    setCurrent(index);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Bloqueo por demasiados intentos
    if (isLockedOut) return;

    if (Object.values(fieldErrors).some(Boolean)) {
      setError('Corrige los campos con errores antes de continuar.');
      return;
    }

    if (!correo || !password) {
      setError('Correo y contraseña son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await login({ correo: sanitizeText(correo, 100), password });
      await loginCtx();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Incrementar contador de intentos fallidos
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        startLockout();
        setError(null); // El banner de lockout reemplaza el error
      } else {
        setError(err.message ?? 'Correo o contraseña incorrectos');
      }
    } finally {
      setLoading(false);
    }
  };

  const attemptsLeft = MAX_ATTEMPTS - failedAttempts;

  return (
    <div className={styles.page}>

      {/* ── Panel izquierdo — carrusel ── */}
      <div className={styles.brandPanel} aria-hidden="true">

        {SLIDES.map((slide, i) => (
          <div
            key={slide.url}
            className={[styles.slide, i === current ? styles.active : ''].join(' ')}
            style={{ backgroundImage: `url(${slide.url})` }}
            role="img"
            aria-label={slide.label}
          />
        ))}

        <div className={styles.slideOverlay} />

        <div className={styles.brandContent}>
          <div className={styles.brandTop}>
            <div className={styles.logoMark}>
              <svg className={styles.logoHex} viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 2L25 8.5V19.5L14 26L3 19.5V8.5L14 2Z"
                  fill="rgba(255,255,255,0.15)"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1"
                />
                <path
                  d="M14 7L21 11V17L14 21L7 17V11L14 7Z"
                  fill="var(--accent)"
                  opacity="0.8"
                />
              </svg>
              <span className={styles.logoName}>
                Cosas<span>de</span>Casa
              </span>
            </div>
          </div>

          <div className={styles.brandBottom}>
            <h1 className={styles.brandHeading}>
              Tu hogar en<br />buenas manos
            </h1>
            <p className={styles.brandSub}>
              Conectamos a profesionales verificados con quienes los necesitan, de forma rápida y segura.
            </p>
            <div className={styles.testimonial}>
              <p className={styles.testimonialText}>
                "Encontré un plomero certificado en menos de 10 minutos. El proceso fue muy sencillo."
              </p>
              <span className={styles.testimonialAuthor}>— Cliente verificado, CDMX</span>
            </div>
            <div className={styles.dots}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={[styles.dot, i === current ? styles.activeDot : ''].join(' ')}
                  onClick={() => goTo(i)}
                  aria-label={`Ir a imagen ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>

          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Iniciar sesión</h2>
            <p className={styles.formSubtitle}>Accede a tu cuenta</p>
          </div>

          {/* Banner de bloqueo por demasiados intentos */}
          {isLockedOut && (
            <div className={styles.lockoutBanner} role="alert" aria-live="assertive">
              <ShieldAlert size={18} className={styles.lockoutIcon} />
              <div className={styles.lockoutText}>
                <strong>Demasiados intentos fallidos</strong>
                <span>
                  Por seguridad, el acceso está bloqueado.
                  Intenta de nuevo en{' '}
                  <span className={styles.lockoutCountdown}>{lockoutSecondsLeft}s</span>
                </span>
              </div>
            </div>
          )}

          {/* Advertencia de intentos restantes */}
          {!isLockedOut && failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && (
            <div className={styles.attemptsWarning} role="status">
              <AlertCircle size={14} />
              <span>
                {attemptsLeft === 1
                  ? 'Último intento antes del bloqueo temporal'
                  : `${attemptsLeft} intentos restantes antes del bloqueo`}
              </span>
            </div>
          )}

          {error && !isLockedOut && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="login-correo">
                Correo electrónico
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <Mail size={16} />
                </span>
                <input
                  id="login-correo"
                  type="email"
                  className={[styles.input, fieldErrors.correo ? styles.inputError : ''].join(' ')}
                  value={correo}
                  onChange={e => {
                    const value = e.target.value;
                    if (isSuspiciousText(value)) {
                      setFieldErrors(p => ({
                        ...p,
                        correo: 'No se permiten etiquetas ni caracteres sospechosos.',
                      }));
                    } else {
                      setCorreo(sanitizeText(value, 100));
                      setFieldErrors(p => ({ ...p, correo: undefined }));
                    }
                  }}
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  required
                  disabled={isLockedOut}
                />
              </div>
              {fieldErrors.correo && <p className={styles.fieldError}>{fieldErrors.correo}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="login-password">
                Contraseña
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <Lock size={16} />
                </span>
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className={[styles.input, fieldErrors.password ? styles.inputError : ''].join(' ')}
                  value={password}
                  onChange={e => {
                    const value = e.target.value;
                    if (isSuspiciousText(value)) {
                      setFieldErrors(p => ({
                        ...p,
                        password: 'Caracteres sospechosos detectados en la contraseña.',
                      }));
                    } else {
                      setPassword(value);
                      setFieldErrors(p => ({ ...p, password: undefined }));
                    }
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={isLockedOut}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && <p className={styles.fieldError}>{fieldErrors.password}</p>}
            </div>

            <button
              id="btn-login"
              type="submit"
              className={[styles.submitBtn, isLockedOut ? styles.submitBtnLocked : ''].join(' ')}
              disabled={loading || !correo || !password || Object.values(fieldErrors).some(Boolean) || isLockedOut}
            >
              {loading
                ? <Loader2 size={17} className={styles.spinner} />
                : isLockedOut
                  ? <ShieldAlert size={17} />
                  : <LogIn size={17} />
              }
              {loading
                ? 'Verificando...'
                : isLockedOut
                  ? `Bloqueado (${lockoutSecondsLeft}s)`
                  : 'Ingresar'
              }
            </button>

            <p className={styles.privacyNoticeText}>
              🔒 Al iniciar sesión, aceptas nuestro{' '}
              <button type="button" onClick={() => setShowAviso(true)} className={styles.linkBtn}>
                Aviso de Privacidad
              </button>
            </p>
          </form>

          <div className={styles.divider}>
            <span>¿Aún no tienes cuenta?</span>
          </div>

          <div className={styles.registerOptions}>
            <button
              id="btn-go-register-profesional"
              type="button"
              className={styles.switchBtnSecondary}
              onClick={() => onGoRegister()}
            >
              Registrarse como profesional
            </button>
            <button
              id="btn-go-register-cliente"
              type="button"
              className={styles.switchBtn}
              onClick={() => onGoRegister('CLIENTE')}
            >
              Registrarse como cliente
            </button>
          </div>

        </div>
      </div>

      {showAviso && (
        <div className={styles.avisoOverlay}>
          <AvisoPrivacidadPage onBack={() => setShowAviso(false)} />
        </div>
      )}

    </div>
  );
}