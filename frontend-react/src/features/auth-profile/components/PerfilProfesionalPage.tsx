import { useState, useEffect, useCallback } from 'react';
import {
  User, Phone, AlignLeft, Briefcase, Tag, Calendar,
  Folder, AlertTriangle, CheckCircle, Save, Loader2,
  RotateCcw, MapPin, Camera, ShieldCheck,

  IdCard,
} from 'lucide-react';

import type { Perfil, UpdatePerfilPayload, DiaHorario, Documento } from '../types/perfil.types';
import { CATEGORIAS_PRINCIPALES } from '../types/perfil.types';
import { getMiPerfil, updatePerfil } from '../services/perfil.service';
import { VerificationBadge } from './VerificationBadge';
import { EtiquetasEditor } from './EtiquetasEditor';
import { DisponibilidadEditor } from './DisponibilidadEditor';
import { PortafolioManager } from './PortafolioManager';
import { ProfileAvatar } from './ProfileAvatar';
import { useAuth } from '../../../context/AuthContext';
import { sanitizeText, sanitizeArrayStrings } from '../../../context/sanitize';
import styles from './PerfilProfesionalPage.module.css';


type TabId = 'informacion' | 'disponibilidad' | 'portafolio';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'informacion', label: 'Información', icon: <User size={16} /> },
  { id: 'disponibilidad', label: 'Disponibilidad', icon: <Calendar size={16} /> },
  { id: 'portafolio', label: 'Portafolio', icon: <Folder size={16} /> },
];

export function PerfilProfesionalPage() {
  const { nombre } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('informacion');

  const [telefono, setTelefono] = useState('');
  const [biografia, setBiografia] = useState('');
  const [categoriaPrincipal, setCategoriaPrincipal] = useState('');
  const [etiquetas, setEtiquetas] = useState<string[]>([]);
  const [aceptaUrgencias, setAceptaUrgencias] = useState(false);
  const [diasYHorarios, setDiasYHorarios] = useState<DiaHorario[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  const populateForm = useCallback((p: Perfil) => {
    setTelefono(sanitizeText(p.telefono ?? ''));
    setBiografia(sanitizeText(p.biografia ?? ''));
    setCategoriaPrincipal(sanitizeText(p.categoriaPrincipal ?? ''));
    setEtiquetas(sanitizeArrayStrings(p.etiquetas ?? []));

    setAceptaUrgencias(p.aceptaUrgencias ?? false);
    setDiasYHorarios(p.diasYHorarios ?? []);
    setDocumentos(p.documentos ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;

    getMiPerfil()
      .then((p) => {
        if (cancelled) return;
        setPerfil(p);
        populateForm(p);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'Error al cargar el perfil';
        setFetchError(msg);
        setLoading(false);
      });

    // loading queda en true por estado inicial; no seteamos aquí para evitar el lint


    return () => {
      cancelled = true;
    };
  }, [populateForm]);


  const handleReset = () => {
    if (perfil) populateForm(perfil);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    const payload: UpdatePerfilPayload = {
      telefono: sanitizeText(telefono || undefined),
      biografia: sanitizeText(biografia || undefined, 800),
      categoriaPrincipal: sanitizeText(categoriaPrincipal || undefined),
      etiquetas: sanitizeArrayStrings(etiquetas),

      aceptaUrgencias,
      diasYHorarios,
    };
    try {
      const updated = await updatePerfil(payload);
      setPerfil(updated);
      populateForm(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los cambios';
      setSaveError(msg);

    } finally {
      setSaving(false);
    }
  };



  const bioMax = 800;
  const bioChars = biografia.length;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <Loader2 size={36} className={styles.spinnerBig} />
          <p>Cargando perfil profesional...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <AlertTriangle size={36} />
          <h2>No se pudo cargar el perfil</h2>
          <p>{fetchError}</p>
          <button className={styles.retryBtn} onClick={() => window.location.reload()}>
            <RotateCcw size={15} /> Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!perfil) return null;

  const TAB_LABELS: Record<TabId, string> = {
    informacion: 'Información profesional',
    disponibilidad: 'Disponibilidad',
    portafolio: 'Portafolio',
  };

  return (
    <div className={styles.shell}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className={styles.sidebar}>

        {/* Avatar + stats */}
        <div className={styles.profileBlock}>
          <div className={styles.avatarWrap}>
            <ProfileAvatar size={72} editable={false} />
            <button className={styles.avatarEdit} aria-label="Cambiar foto">
              <Camera size={11} />
            </button>
          </div>
          <div className={styles.profileName}>{nombre ?? 'Mi Perfil'}</div>
          {perfil.categoriaPrincipal && (
            <span className={styles.profileCat}>{perfil.categoriaPrincipal}</span>
          )}
          <div className={styles.statRow}>
            <div className={styles.stat}>
              <span className={styles.statVal}>
                {perfil.promedioCalificacion.toFixed(1)}
              </span>
              <span className={styles.statLbl}>Rating</span>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className={styles.metaList}>
          {(perfil.municipio || perfil.estadoRep) && (
            <div className={styles.metaItem}>
              <MapPin size={15} className={styles.metaIcon} />
              {perfil.municipio}{perfil.estadoRep ? `, ${perfil.estadoRep}` : ''}
            </div>
          )}
          {perfil.telefono && (
            <div className={styles.metaItem}>
              <Phone size={15} className={styles.metaIcon} />
              {perfil.telefono}
            </div>
          )}
        </div>

        {/* Verification */}
        <div className={styles.verifBadge}>
          <ShieldCheck size={15} />
          <VerificationBadge estado={perfil.estadoVerificacion} />
        </div>

        {/* Nav */}
        <nav className={styles.navSection}>
          <span className={styles.navLabel}>Configuración</span>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.navItem} ${activeTab === tab.id ? styles.navActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Urgencias toggle */}
        <div className={styles.urgenciaToggle}>
          <div className={styles.urgInfo}>
            <span className={styles.urgLabel}>Acepta urgencias</span>
            <span className={styles.urgSub}>Contacto fuera de horario</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={aceptaUrgencias}
            className={`${styles.knob} ${aceptaUrgencias ? styles.knobOn : ''}`}
            onClick={() => setAceptaUrgencias(!aceptaUrgencias)}
            aria-label="Acepta urgencias"
          />
        </div>
      </aside>

      {/* ── Main panel ──────────────────────────────────────────────────── */}
      <div className={styles.main}>

        {/* Topbar */}
        <div className={styles.topbar}>
          <div className={styles.topbarTitle}>
            <span className={styles.breadcrumb}>Mi perfil</span>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.pageTitle}>{TAB_LABELS[activeTab]}</span>
          </div>
          {activeTab !== 'portafolio' && (
            <div className={styles.topbarActions}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={handleReset}
                disabled={saving}
              >
                <RotateCcw size={14} />
                Descartar
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? <Loader2 size={14} className={styles.spinner} />
                  : <Save size={14} />}
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className={styles.alertArea}>
          {saveSuccess && (
            <div className={`${styles.alert} ${styles.alertOk}`} role="alert">
              <CheckCircle size={15} />
              Perfil actualizado correctamente
            </div>
          )}
          {saveError && (
            <div className={`${styles.alert} ${styles.alertErr}`} role="alert">
              <AlertTriangle size={15} />
              {saveError}
            </div>
          )}
        </div>

        {/* ── Tab: Información ──────────────────────────────────────────── */}
        {activeTab === 'informacion' && (
          <div className={styles.content}>

            {/* Datos de contacto */}
            <div className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <IdCard size={15} />
                  Datos de contacto
                </div>
                <span className={styles.cardBadge}>2 campos</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel} htmlFor="telefono">
                      <Phone size={12} /> Teléfono
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      className={styles.fieldInput}
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel} htmlFor="categoria">
                      <Briefcase size={12} /> Categoría principal
                    </label>
                    <select
                      id="categoria"
                      className={styles.fieldInput}
                      value={categoriaPrincipal}
                      onChange={(e) => setCategoriaPrincipal(e.target.value)}
                    >
                      <option value="">— Seleccionar —</option>
                      {CATEGORIAS_PRINCIPALES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Biografía */}
            <div className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <AlignLeft size={15} />
                  Biografía profesional
                </div>
                <span className={`${styles.cardBadge} ${bioChars > bioMax * 0.9 ? styles.cardBadgeWarn : ''}`}>
                  {bioChars} / {bioMax}
                </span>
              </div>
              <div className={styles.cardBody}>
                <textarea
                  className={styles.fieldInput}
                  value={biografia}
                  onChange={(e) => {
                    if (e.target.value.length <= bioMax) setBiografia(e.target.value);
                  }}
                  rows={5}
                  placeholder="Describe tu experiencia, especialidades y qué te hace único como profesional..."
                />
              </div>
            </div>

            {/* Etiquetas */}
            <div className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <Tag size={15} />
                  Subespecialidades
                </div>
                <span className={styles.cardBadge}>{etiquetas.length} etiquetas</span>
              </div>
              <div className={styles.cardBody}>
                <EtiquetasEditor etiquetas={etiquetas} onChange={setEtiquetas} />
              </div>
            </div>

          </div>
        )}

        {/* ── Tab: Disponibilidad ───────────────────────────────────────── */}
        {activeTab === 'disponibilidad' && (
          <div className={styles.content}>
            <div className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <Calendar size={15} />
                  Calendario de atención
                </div>
                <span className={styles.cardBadge}>{diasYHorarios.length} días</span>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.sectionDesc}>
                  Configura los días y horarios en los que estarás disponible para atender clientes.
                </p>
                <DisponibilidadEditor
                  diasYHorarios={diasYHorarios}
                  onChange={setDiasYHorarios}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Portafolio ───────────────────────────────────────────── */}
        {activeTab === 'portafolio' && (
          <div className={styles.content}>
            <div className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <Folder size={15} />
                  Portafolio de evidencias
                </div>
                <span className={styles.cardBadge}>{documentos.length} archivos</span>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.sectionDesc}>
                  Sube imágenes de trabajos realizados, identificación oficial o cédula profesional.
                </p>
                <PortafolioManager documentos={documentos} onUpdate={setDocumentos} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}