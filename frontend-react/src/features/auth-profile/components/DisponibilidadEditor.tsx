import { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import type { DiaHorario } from '../types/perfil.types';
import { DIAS_SEMANA } from '../types/perfil.types';
import styles from './DisponibilidadEditor.module.css';

interface Props {
  diasYHorarios: DiaHorario[];
  onChange: (dias: DiaHorario[]) => void;
  disabled?: boolean;
}

const HORARIO_DEFAULT: Omit<DiaHorario, 'dia'> = {
  horaInicio: '09:00',
  horaFin: '18:00',
};

export function DisponibilidadEditor({ diasYHorarios, onChange, disabled }: Props) {
  const [selectedDia, setSelectedDia] = useState(DIAS_SEMANA[0]);

  const addDia = () => {
    if (diasYHorarios.some((d) => d.dia === selectedDia)) return;
    onChange([...diasYHorarios, { dia: selectedDia, ...HORARIO_DEFAULT }]);
  };

  const removeDia = (dia: string) => {
    onChange(diasYHorarios.filter((d) => d.dia !== dia));
  };

  const updateHorario = (
    dia: string,
    field: 'horaInicio' | 'horaFin',
    value: string
  ) => {
    onChange(
      diasYHorarios.map((d) =>
        d.dia === dia ? { ...d, [field]: value } : d
      )
    );
  };

  const availableDias = DIAS_SEMANA.filter(
    (d) => !diasYHorarios.some((dh) => dh.dia === d)
  );

  return (
    <div className={styles.container}>
      {diasYHorarios.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <Calendar size={22} strokeWidth={1.5} />
          </div>
          <p className={styles.emptyTitle}>Sin horarios configurados</p>
          <span className={styles.emptySub}>Agrega los días en que estás disponible</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {diasYHorarios.map((dh) => (
            <div key={dh.dia} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.diaName}>{dh.dia}</span>
                {!disabled && (
                  <button
                    type="button"
                    className={styles.delBtn}
                    onClick={() => removeDia(dh.dia)}
                    aria-label={`Eliminar ${dh.dia}`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className={styles.times}>
                <div className={styles.timeField}>
                  <span className={styles.timeLbl}>Desde</span>
                  <input
                    type="time"
                    className={styles.timeIn}
                    value={dh.horaInicio}
                    onChange={(e) => updateHorario(dh.dia, 'horaInicio', e.target.value)}
                    disabled={disabled}
                  />
                </div>
                <div className={styles.sep}>
                  <span className={styles.sepIcon}>hasta</span>
                </div>
                <div className={styles.timeField}>
                  <span className={styles.timeLbl}>Hasta</span>
                  <input
                    type="time"
                    className={styles.timeIn}
                    value={dh.horaFin}
                    onChange={(e) => updateHorario(dh.dia, 'horaFin', e.target.value)}
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!disabled && availableDias.length > 0 && (
        <div className={styles.addRow}>
          <select
            className={styles.daySel}
            value={selectedDia}
            onChange={(e) => setSelectedDia(e.target.value)}
          >
            {availableDias.map((dia) => (
              <option key={dia} value={dia}>{dia}</option>
            ))}
          </select>
          <button type="button" className={styles.addBtn} onClick={addDia}>
            <Plus size={15} />
            Agregar día
          </button>
        </div>
      )}
    </div>
  );
}