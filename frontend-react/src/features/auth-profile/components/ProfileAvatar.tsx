import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { uploadFotoPerfil } from '../services/auth.service';
import styles from './ProfileAvatar.module.css';

interface Props {
  size?: number;
  editable?: boolean;
}

function getInitials(nombre: string | null) {
  if (!nombre) return 'U';
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function ProfileAvatar({ size = 100, editable = false }: Props) {
  const { fotoPerfil, nombre, login } = useAuth(); // login refreshes session
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g., 5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      await uploadFotoPerfil(file);
      // Refresh AuthContext to get new picture URL
      await login();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={styles.avatarContainer}>
      <div 
        className={styles.avatarWrapper} 
        style={{ width: size, height: size }}
      >
        {fotoPerfil ? (
          <>
            <img
              src={fotoPerfil}
              alt="Foto de perfil"
              className={styles.avatarImage}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                fallback.style.display = 'flex';
              }}
            />
            <div 
              className={styles.avatarFallback} 
              style={{ display: 'none', width: '100%', height: '100%', fontSize: size * 0.4, fontWeight: 'bold' }}
            >
              {getInitials(nombre)}
            </div>
          </>
        ) : (
          <div 
            className={styles.avatarFallback} 
            style={{ width: '100%', height: '100%', fontSize: size * 0.4, fontWeight: 'bold' }}
          >
            {getInitials(nombre)}
          </div>
        )}

        {editable && (
          <div className={styles.overlay} onClick={() => fileInputRef.current?.click()}>
            {uploading ? (
              <Loader2 className={styles.spinner} size={size * 0.3} />
            ) : (
              <Camera size={size * 0.3} />
            )}
          </div>
        )}
      </div>

      {editable && (
        <input
          type="file"
          ref={fileInputRef}
          className={styles.hiddenInput}
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
          disabled={uploading}
        />
      )}
      
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
