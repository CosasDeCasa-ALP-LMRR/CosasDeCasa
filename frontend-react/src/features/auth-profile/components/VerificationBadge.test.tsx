import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VerificationBadge } from './VerificationBadge';
import type { EstadoVerificacion } from '../types/perfil.types';

describe('VerificationBadge Component', () => {
  it('debe renderizar correctamente con el estado PENDIENTE', () => {
    render(<VerificationBadge estado={'PENDIENTE' as EstadoVerificacion} />);
    
    // Verifica que el texto esté presente
    expect(screen.getByText('Verificación Pendiente')).toBeInTheDocument();
  });

  it('debe renderizar correctamente con el estado APROBADO', () => {
    render(<VerificationBadge estado={'APROBADO' as EstadoVerificacion} />);
    
    expect(screen.getByText('Perfil Aprobado')).toBeInTheDocument();
  });

  it('debe renderizar correctamente con el estado RECHAZADO', () => {
    render(<VerificationBadge estado={'RECHAZADO' as EstadoVerificacion} />);
    
    expect(screen.getByText('Perfil Rechazado')).toBeInTheDocument();
  });

  it('debe usar PENDIENTE por defecto si se pasa un estado inválido', () => {
    render(<VerificationBadge estado={'INVALIDO' as any} />);
    
    expect(screen.getByText('Verificación Pendiente')).toBeInTheDocument();
  });
});
