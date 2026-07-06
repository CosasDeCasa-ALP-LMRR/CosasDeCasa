/**
 * @fileoverview DTO de entrada para el endpoint de contacto via WhatsApp.
 * @author Luis Manuel
 * @date 04/07/2026
 * @requirement RF: Transferencia segura de datos con API de terceros
 *
 * Se validan y limitan los campos de entrada para aplicar el principio de
 * minimización de datos antes de retransmitirlos a la API de Meta/WhatsApp.
 */

import { IsString, IsPhoneNumber, MaxLength, MinLength } from 'class-validator';

export class ContactarProfesionalDto {
  /**
   * Número de teléfono del profesionista en formato E.164 (ej: +521234567890).
   * La validación asegura que solo se retransmitan números con formato válido.
   */
  @IsString()
  @IsPhoneNumber()
  telefono: string;

  /**
   * Mensaje de texto que el cliente desea enviar al profesionista.
   * Se limita a 1000 caracteres para evitar abuso y cumplir con los
   * límites de la WhatsApp Cloud API.
   */
  @IsString()
  @MinLength(1, { message: 'El mensaje no puede estar vacío' })
  @MaxLength(1000, { message: 'El mensaje no puede exceder 1000 caracteres' })
  mensaje: string;
}
