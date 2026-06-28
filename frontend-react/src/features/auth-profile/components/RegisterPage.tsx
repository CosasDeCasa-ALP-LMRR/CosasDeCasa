/**
 * @fileoverview RegisterPage — crear cuenta de profesional (RF1)
 * @date 27/06/2026
 */
import { useState, useEffect, useRef, type FormEvent } from 'react';
import {
  User, Mail, Lock, Eye, EyeOff,
  UserPlus, Loader2, AlertCircle, CheckCircle, ArrowLeft,
} from 'lucide-react';
import { register } from '../services/auth.service';
import { useAuth } from '../../../context/AuthContext';
import styles from './RegisterPage.module.css';

interface Props {
  onGoLogin: () => void;
  defaultRole?: 'PROFESIONAL' | 'CLIENTE';
}

interface FieldErrors {
  nombre?: string;
  correo?: string;
  password?: string;
  confirm?: string;
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

function validate(
  nombre: string,
  correo: string,
  password: string,
  confirm: string,
): FieldErrors {
  const errors: FieldErrors = {};
  if (!nombre.trim()) errors.nombre = 'El nombre es requerido';
  if (!correo.includes('@')) errors.correo = 'Ingresa un correo válido';
  if (password.length < 8) errors.password = 'Mínimo 8 caracteres';
  if (password !== confirm) errors.confirm = 'Las contraseñas no coinciden';
  return errors;
}

export function RegisterPage({ onGoLogin, defaultRole = 'CLIENTE' }: Props) {
  const { login: loginCtx } = useAuth();

  const [rol, setRol] = useState<'PROFESIONAL' | 'CLIENTE'>(defaultRole);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][strength];
  const strengthClass = [
    '',
    styles.strengthWeak,
    styles.strengthFair,
    styles.strengthGood,
    styles.strengthStrong,
  ][strength];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors = validate(nombre, correo, password, confirm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await register({ nombre, correo, password, rol });
      setSuccess(true);
      setTimeout(async () => await loginCtx(), 1800);
    } catch (err: any) {
      setError(err.message ?? 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.formPanel}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <CheckCircle size={48} strokeWidth={1.5} />
            </div>
            <h2 className={styles.successTitle}>¡Cuenta creada!</h2>
            <p className={styles.successText}>
              Tu cuenta de {rol.toLowerCase()} está lista. Redirigiendo...
            </p>
            <div className={styles.successBar} />
          </div>
        </div>
      </div>
    );
  }

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
              Únete como<br />
              <span>
                {rol === 'CLIENTE' ? 'Cliente' : 'Profesional'}
              </span>
            </h1>
            <p className={styles.brandSub}>
              {rol === 'CLIENTE'
                ? 'Encuentra a los mejores expertos para reparar y mejorar tu hogar.'
                : 'Registra tu perfil, sube tu portafolio y empieza a recibir clientes hoy mismo.'}
            </p>
            <div className={styles.steps}>
              {(rol === 'CLIENTE'
                ? ['Crea tu cuenta', 'Busca servicios', 'Contacta al experto']
                : ['Crea tu cuenta', 'Completa tu perfil', 'Recibe solicitudes']
              ).map((s, i) => (
                <div className={styles.step} key={s}>
                  <div className={styles.stepNum}>{i + 1}</div>
                  <span>{s}</span>
                </div>
              ))}
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

          <button className={styles.backBtn} type="button" onClick={onGoLogin}>
            <ArrowLeft size={15} />
            Ya tengo cuenta
          </button>

          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Crear cuenta</h2>
            <p className={styles.formSubtitle}>Registro de usuario</p>
          </div>

          <div className={styles.roleTabs}>
            <button
              type="button"
              className={[styles.roleTab, rol === 'CLIENTE' ? styles.activeTab : ''].join(' ')}
              onClick={() => setRol('CLIENTE')}
            >
              Soy cliente
            </button>
            <button
              type="button"
              className={[styles.roleTab, rol === 'PROFESIONAL' ? styles.activeTab : ''].join(' ')}
              onClick={() => setRol('PROFESIONAL')}
            >
              Soy profesional
            </button>
          </div>

          {error && (
            <div className={styles.errorBanner} role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="reg-nombre">
                Nombre completo
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><User size={16} /></span>
                <input
                  id="reg-nombre"
                  type="text"
                  className={[styles.input, fieldErrors.nombre ? styles.inputError : ''].join(' ')}
                  value={nombre}
                  onChange={e => { setNombre(e.target.value); setFieldErrors(p => ({ ...p, nombre: undefined })); }}
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                />
              </div>
              {fieldErrors.nombre && <p className={styles.fieldError}>{fieldErrors.nombre}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="reg-correo">
                Correo electrónico
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><Mail size={16} /></span>
                <input
                  id="reg-correo"
                  type="email"
                  className={[styles.input, fieldErrors.correo ? styles.inputError : ''].join(' ')}
                  value={correo}
                  onChange={e => { setCorreo(e.target.value); setFieldErrors(p => ({ ...p, correo: undefined })); }}
                  placeholder="tu@correo.com"
                  autoComplete="email"
                />
              </div>
              {fieldErrors.correo && <p className={styles.fieldError}>{fieldErrors.correo}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="reg-password">
                Contraseña
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><Lock size={16} /></span>
                <input
                  id="reg-password"
                  type={showPwd ? 'text' : 'password'}
                  className={[styles.input, fieldErrors.password ? styles.inputError : ''].join(' ')}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })); }}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
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
              {password && (
                <div className={styles.strengthRow}>
                  <div className={styles.strengthBars}>
                    {[1, 2, 3, 4].map(n => (
                      <div
                        key={n}
                        className={[styles.strengthBar, strength >= n ? strengthClass : ''].join(' ')}
                      />
                    ))}
                  </div>
                  <span className={[styles.strengthLabel, strengthClass].join(' ')}>
                    {strengthLabel}
                  </span>
                </div>
              )}
              {fieldErrors.password && <p className={styles.fieldError}>{fieldErrors.password}</p>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel} htmlFor="reg-confirm">
                Confirmar contraseña
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><Lock size={16} /></span>
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  className={[styles.input, fieldErrors.confirm ? styles.inputError : ''].join(' ')}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setFieldErrors(p => ({ ...p, confirm: undefined })); }}
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.confirm && <p className={styles.fieldError}>{fieldErrors.confirm}</p>}
            </div>

            <button
              id="btn-register"
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading
                ? <Loader2 size={17} className={styles.spinner} />
                : <UserPlus size={17} />
              }
              {loading
                ? 'Creando cuenta...'
                : rol === 'CLIENTE' ? 'Crear cuenta de cliente' : 'Crear cuenta profesional'
              }
            </button>

          </form>
        </div>
      </div>

    </div>
  );
}