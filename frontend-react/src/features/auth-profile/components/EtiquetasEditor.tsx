/**
 * @fileoverview Etiquetas (tags) editor component for RF2
 */
import { useState, type KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';
import { sanitizeText, isSuspiciousText } from '../../../context/sanitize';
import styles from './EtiquetasEditor.module.css';

interface Props {
  etiquetas: string[];
  onChange: (etiquetas: string[]) => void;
  disabled?: boolean;
}

export function EtiquetasEditor({ etiquetas, onChange, disabled }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const addTag = () => {
    const sanitizedTag = sanitizeText(inputValue.trim(), 50);
    if (!sanitizedTag) {
      setInputError('La etiqueta no puede estar vacía.');
      return;
    }
    if (isSuspiciousText(inputValue)) {
      setInputError('No se permiten etiquetas HTML ni caracteres sospechosos.');
      return;
    }
    if (!etiquetas.includes(sanitizedTag)) {
      onChange([...etiquetas, sanitizedTag]);
    }
    setInputValue('');
    setInputError(null);
  };

  const removeTag = (tag: string) => {
    onChange(etiquetas.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !inputValue && etiquetas.length > 0) {
      onChange(etiquetas.slice(0, -1));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tagList}>
        {etiquetas.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
            {!disabled && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeTag(tag)}
                aria-label={`Eliminar etiqueta ${tag}`}
              >
                <X size={12} />
              </button>
            )}
          </span>
        ))}
        {!disabled && (
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={[styles.input, inputError ? styles.inputError : ''].join(' ')}
              value={inputValue}
              onChange={(e) => {
                const value = e.target.value;
                if (isSuspiciousText(value)) {
                  setInputError('No se permiten etiquetas HTML ni caracteres sospechosos.');
                } else {
                  setInputValue(sanitizeText(value, 50));
                  setInputError(null);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder={etiquetas.length === 0 ? 'Agregar subespecialidad...' : ''}
            />
            {inputError && <p className={styles.fieldError}>{inputError}</p>}
            {inputValue && (
              <button
                type="button"
                className={styles.addBtn}
                onClick={addTag}
                aria-label="Agregar etiqueta"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      {!disabled && (
        <p className={styles.hint}>
          Presiona <kbd>Enter</kbd> o <kbd>,</kbd> para agregar
        </p>
      )}
    </div>
  );
}
