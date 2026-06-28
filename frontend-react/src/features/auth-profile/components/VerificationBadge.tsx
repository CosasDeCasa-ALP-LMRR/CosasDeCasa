/**
 * @fileoverview Verification Badge Component for RF2
 */
import type { EstadoVerificacion } from '../types/perfil.types';
import { ShieldCheck, ShieldAlert, ShieldX, Clock } from 'lucide-react';
import styles from './VerificationBadge.module.css';

interface Props {
  estado: EstadoVerificacion;
}

const CONFIG = {
  APROBADO: {
    label: 'Perfil Aprobado',
    icon: ShieldCheck,
    className: styles.aprobado,
  },
  PENDIENTE: {
    label: 'Verificación Pendiente',
    icon: Clock,
    className: styles.pendiente,
  },
  RECHAZADO: {
    label: 'Perfil Rechazado',
    icon: ShieldX,
    className: styles.rechazado,
  },
};

export function VerificationBadge({ estado }: Props) {
  const cfg = CONFIG[estado] ?? CONFIG.PENDIENTE;
  const Icon = cfg.icon;

  return (
    <span className={`${styles.badge} ${cfg.className}`}>
      <Icon size={14} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}
