/**
 * @fileoverview Portfolio (Documentos) manager component for RF2
 */
import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Image,
  Trash2,
  ExternalLink,
  Loader2,
  Info,
  Sparkles,
  X,
} from 'lucide-react';
import type { DocumentoPublico } from '../types/perfil.types';
import type { EstadoVerificacion } from '../types/perfil.types';
import { TIPOS_DOCUMENTO } from '../types/perfil.types';
import { uploadDocumento, deleteDocumento } from '../services/perfil.service';
import { ImageCarousel } from './ImageCarousel';
import styles from './PortafolioManager.module.css';

interface Props {
  documentos: DocumentoPublico[];
  onUpdate: (docs: DocumentoPublico[]) => void;
  estadoVerificacion?: EstadoVerificacion;
  onReEvaluacion?: (estado: EstadoVerificacion) => void;
}

function getFileIcon(urlArchivo: string) {
  const ext = urlArchivo.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return <Image size={20} />;
  }
  return <FileText size={20} />;
}

export function PortafolioManager({ documentos, onUpdate, estadoVerificacion, onReEvaluacion }: Props) {
  const [selectedTipo, setSelectedTipo] = useState(TIPOS_DOCUMENTO[0].value);
  const [uploading, setUploading] = useState(false);
  const [consentimientoIA, setConsentimientoIA] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reEvalToast, setReEvalToast] = useState<{ show: boolean, mensaje: string }>({ show: false, mensaje: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showReEvalToast = (mensaje: string) => {
    setReEvalToast({ show: true, mensaje });
    setTimeout(() => setReEvalToast({ show: false, mensaje: '' }), 8000);
  };

  const portfolioImages = documentos
    .filter(d => d.tipo === 'PORTAFOLIO')
    .map(d => d.urlArchivo)
    .filter(url => ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => url.toLowerCase().endsWith(ext)));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const result = await uploadDocumento(file, selectedTipo, consentimientoIA);

      if (result.documento) {
        const newDoc: DocumentoPublico = {
          id: result.documento.id,
          tipo: result.documento.tipo as string,
          urlArchivo: result.documento.urlArchivo,
          fechaSubida: new Date().toISOString(),
        };
        onUpdate([...documentos, newDoc]);
      }

      // Si se subió INE o CÉDULA, puede haber cambiado el estado de verificación
      if (selectedTipo === 'INE' || selectedTipo === 'CEDULA') {
        const mensaje = result.mensajeValidacion ||
          (result.estadoVerificacion === 'PENDIENTE' ? 'Tu perfil ha vuelto a estado "Pendiente" tras subir un nuevo documento.' : 'Documento procesado.');

        showReEvalToast(mensaje);

        if (result.estadoVerificacion !== estadoVerificacion) {
          onReEvaluacion?.(result.estadoVerificacion as EstadoVerificacion);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (doc: DocumentoPublico) => {
    setDeletingId(doc.id);
    setError(null);
    try {
      await deleteDocumento(doc.id);
      onUpdate(documentos.filter((d) => d.id !== doc.id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el documento');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const tipoLabel = (tipo: string) =>
    TIPOS_DOCUMENTO.find((t) => t.value === tipo)?.label ?? tipo;

  return (
    <div className={styles.container}>
      {portfolioImages.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <ImageCarousel images={portfolioImages} />
        </div>
      )}

      {/* Upload Area */}
      <div className={styles.uploadSection}>
        <div className={`${styles.consentSection} ${(selectedTipo === 'INE' || selectedTipo === 'CEDULA') ? styles.consentActive : ''}`}>
          <div className={styles.consentHeader}>
            <Sparkles size={18} className={styles.aiIcon} />
            <strong>Validación Rápida con Inteligencia Artificial</strong>
          </div>
          <label className={styles.consentLabel}>
            <input
              type="checkbox"
              checked={consentimientoIA}
              onChange={(e) => setConsentimientoIA(e.target.checked)}
              disabled={uploading}
              className={styles.consentCheckbox}
            />
            <span className={styles.consentText}>
              Autorizo el análisis de mi documento con Inteligencia Artificial para acelerar la activación de mi perfil sin esperar una revisión manual.
            </span>
          </label>
        </div>

        <div className={styles.uploadControls}>
          <select
            className={styles.tipoSelect}
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            disabled={uploading}
          >
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !consentimientoIA}
            title={!consentimientoIA ? 'Debe aceptar el consentimiento de IA' : ''}
          >
            {uploading ? (
              <Loader2 size={16} className={styles.spinner} />
            ) : (
              <Upload size={16} />
            )}
            {uploading ? ((selectedTipo === 'INE' || selectedTipo === 'CEDULA') && consentimientoIA ? 'Validando con IA...' : 'Subiendo...') : 'Subir archivo'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>


        {error && (
          <p className={styles.errorMsg}>
            {error}
          </p>
        )}
      </div>

      {/* Lista de documentos */}
      {documentos.length === 0 ? (
        <div className={styles.empty}>
          <Upload size={36} strokeWidth={1.2} />
          <p>Sin documentos en el portafolio</p>
          <span>Sube imágenes o documentos para mostrar tu experiencia</span>
        </div>
      ) : (
        <div className={styles.docList}>
          {documentos.map((doc) => (
            <div key={doc.id} className={styles.docItem}>
              <div className={styles.docIcon}>
                {['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => doc.urlArchivo.toLowerCase().endsWith(ext)) ? (
                  <img src={doc.urlArchivo} alt="Miniatura" className={styles.docThumbnail} />
                ) : (
                  getFileIcon(doc.urlArchivo)
                )}
              </div>
              <div className={styles.docInfo}>
                <span className={styles.docTipo}>{tipoLabel(doc.tipo)}</span>
                <span className={styles.docFecha}>{formatDate(doc.fechaSubida)}</span>
              </div>
              <div className={styles.docActions}>
                <a
                  href={doc.urlArchivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.viewBtn}
                  title="Ver archivo"
                >
                  <ExternalLink size={15} />
                </a>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(doc)}
                  disabled={deletingId === doc.id}
                  title="Eliminar"
                >
                  {deletingId === doc.id ? (
                    <Loader2 size={15} className={styles.spinner} />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de re-evaluación / IA */}
      {reEvalToast.show && (
        <div className={styles.modalOverlay} onClick={() => setReEvalToast({ show: false, mensaje: '' })}>
          <div
            className={`${styles.modalContent} ${reEvalToast.mensaje.includes('exitosamente') ? styles.modalSuccess : styles.modalWarning}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalCloseBtn}
              onClick={() => setReEvalToast({ show: false, mensaje: '' })}
            >
              <X size={20} />
            </button>

            <div className={styles.modalIconWrapper}>
              {reEvalToast.mensaje.includes('exitosamente') ? (
                <Sparkles size={36} className={styles.toastIconSparkle} />
              ) : (
                <Info size={36} className={styles.toastIconInfo} />
              )}
            </div>

            <div className={styles.modalTextBody}>
              <h3 className={styles.modalTitle}>
                {reEvalToast.mensaje.includes('exitosamente') ? 'Identidad Validada' : 'Aviso de Revisión'}
              </h3>
              <p className={styles.modalDesc}>{reEvalToast.mensaje}</p>
            </div>

            <button
              className={`${styles.modalActionBtn} ${reEvalToast.mensaje.includes('exitosamente') ? styles.btnSuccess : styles.btnWarning}`}
              onClick={() => setReEvalToast({ show: false, mensaje: '' })}
            >
              {reEvalToast.mensaje.includes('exitosamente') ? 'Continuar' : 'Entendido'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
