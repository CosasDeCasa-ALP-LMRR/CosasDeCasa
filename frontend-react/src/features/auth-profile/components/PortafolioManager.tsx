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
} from 'lucide-react';
import type { Documento } from '../types/perfil.types';
import { TIPOS_DOCUMENTO } from '../types/perfil.types';
import { uploadDocumento, deleteDocumento } from '../services/perfil.service';
import { ImageCarousel } from './ImageCarousel';
import styles from './PortafolioManager.module.css';

interface Props {
  documentos: Documento[];
  onUpdate: (docs: Documento[]) => void;
}

function getFileIcon(urlArchivo: string) {
  const ext = urlArchivo.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return <Image size={20} />;
  }
  return <FileText size={20} />;
}

export function PortafolioManager({ documentos, onUpdate }: Props) {
  const [selectedTipo, setSelectedTipo] = useState(TIPOS_DOCUMENTO[0].value);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const result = await uploadDocumento(file, selectedTipo);
      const newDoc: Documento = {
        id: result.id,
        perfilId: '',
        tipo: result.tipo,
        urlArchivo: result.urlArchivo,
        fechaSubida: new Date().toISOString(),
      };
      onUpdate([...documentos, newDoc]);
    } catch (err: any) {
      setError(err.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (doc: Documento) => {
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

  const formatDate = (dateStr: string) => {
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
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 size={16} className={styles.spinner} />
            ) : (
              <Upload size={16} />
            )}
            {uploading ? 'Subiendo...' : 'Subir archivo'}
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

      {/* Documents List */}
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
    </div>
  );
}
