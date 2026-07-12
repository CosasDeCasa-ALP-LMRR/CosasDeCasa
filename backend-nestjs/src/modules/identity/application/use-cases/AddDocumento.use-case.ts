/**
 * @fileoverview Caso de uso para subir y registrar un nuevo documento o foto al portafolio.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { IDocumentoRepository } from '../../domain/repositories/IDocumentoRepository';
import { Documento } from '../../domain/entities/Documento';
import { IStorageAdapter } from '../../domain/adapters/IStorageAdapter';
import { IPerfilRepository } from '../../domain/repositories/IPerfilRepository';
import { GetPerfilUseCase } from './GetPerfil.use-case';
import { randomUUID } from 'crypto';
import { IOcrAdapter } from '../../domain/adapters/IOcrAdapter';
import { IUsuarioRepository } from '../../domain/repositories/IUsuarioRepository';

@Injectable()
export class AddDocumentoUseCase {
  private readonly logger = new Logger(AddDocumentoUseCase.name);

  constructor(
    private readonly documentoRepository: IDocumentoRepository,
    private readonly storageAdapter: IStorageAdapter,
    private readonly getPerfilUseCase: GetPerfilUseCase,
    private readonly perfilRepository: IPerfilRepository,
    private readonly ocrAdapter: IOcrAdapter,
    private readonly usuarioRepository: IUsuarioRepository,
  ) {}

  async execute(
    usuarioId: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    tipo: string,
    consentimientoIA: boolean = false,
  ): Promise<{
    documento?: Documento;
    estadoVerificacion: string;
    mensajeValidacion?: string;
  }> {
    const validTipos = ['INE', 'CEDULA', 'PORTAFOLIO'];
    if (!validTipos.includes(tipo)) {
      throw new BadRequestException(
        `Tipo de documento inválido: ${tipo}. Debe ser uno de ${validTipos.join(', ')}`,
      );
    }

    const perfil = await this.getPerfilUseCase.executeByUsuarioId(usuarioId);
    let nuevoEstadoVerificacion = perfil.estadoVerificacion;
    let mensajeValidacion = '';
    let saveDocument = true;

    // Validación automática con IA si es INE o CEDULA
    if ((tipo === 'INE' || tipo === 'CEDULA') && consentimientoIA) {
      const usuario = await this.usuarioRepository.findById(usuarioId);
      if (!usuario) {
        throw new BadRequestException('Usuario no encontrado');
      }

      const ocrResult = await this.ocrAdapter.extractIdentityData(
        fileBuffer,
        mimeType,
      );

      if (!ocrResult.valido) {
        // En lugar de rechazarlo automáticamente, lo mandamos a revisión manual por si la IA se equivocó o falló la API
        nuevoEstadoVerificacion = 'PENDIENTE';
        mensajeValidacion =
          ocrResult.motivoRechazo ||
          'El documento no se pudo leer automáticamente. Pasó a revisión manual.';
        saveDocument = true; // Se guarda para que el auditor humano pueda verlo
      } else {
        // Validar match
        // Helper para quitar acentos y normalizar
        const removeAccents = (str: string) => {
          return str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
        };

        const dbNombre = removeAccents(usuario.nombre);
        const ocrNombre = removeAccents(ocrResult.nombre || '');
        const dbCurp = removeAccents(usuario.curp || '');
        const ocrCurp = removeAccents(ocrResult.curp || '');

        // Tolerancia básica (ej. si el nombre contiene las partes clave o es muy similar)
        // Para simplificar, requerimos que el curp coincida exacto si existe en bd.
        // Si el usuario no tiene CURP en la BD, requerimos que el nombre coincida.
        const curpMatch = dbCurp ? dbCurp === ocrCurp : true;

        // Match simple de nombre: ver si las palabras clave del OCR están en el nombre de BD
        const nameTokens = ocrNombre.split(' ').filter((t) => t.length > 2);
        const nameMatch =
          nameTokens.length > 0 &&
          nameTokens.every((token) => dbNombre.includes(token));

        if (curpMatch && nameMatch) {
          nuevoEstadoVerificacion = 'APROBADO';
          mensajeValidacion = 'Identidad validada exitosamente mediante IA.';
          saveDocument = false; // RF7: Se destruye (no se guarda) tras validación exitosa, no se necesita para revisión manual.
        } else {
          // Discrepancia: Pasa a revisión manual
          nuevoEstadoVerificacion = 'PENDIENTE';
          mensajeValidacion =
            'Los datos no coinciden exactamente. Un auditor revisará el documento.';
          saveDocument = true; // Se guarda para que el auditor pueda verlo

          // Si el usuario no tenía CURP registrado pero la IA extrajo uno, lo guardamos para el auditor
          if (!usuario.curp && ocrResult.curp) {
            await this.usuarioRepository.update(usuario.id, {
              curp: ocrResult.curp.toUpperCase(),
            });
          }
        }
      }

      await this.perfilRepository.update(perfil.id, {
        estadoVerificacion: nuevoEstadoVerificacion,
      });
    } else if (tipo === 'INE' || tipo === 'CEDULA') {
      // Si sube un doc pero no da consentimiento, no debería llegar aquí por validación del controller,
      // pero por si acaso, lo mandamos a PENDIENTE
      nuevoEstadoVerificacion = 'PENDIENTE';
      await this.perfilRepository.update(perfil.id, {
        estadoVerificacion: nuevoEstadoVerificacion,
      });
    }

    let savedDocument: Documento | undefined;
    if (saveDocument) {
      const urlArchivo = await this.storageAdapter.saveFile(
        fileBuffer,
        fileName,
        mimeType,
      );

      const documento = new Documento(
        randomUUID(),
        perfil.id,
        tipo,
        urlArchivo,
        new Date(),
      );

      savedDocument = await this.documentoRepository.save(documento);
    }

    return {
      documento: savedDocument,
      estadoVerificacion: nuevoEstadoVerificacion,
      mensajeValidacion,
    };
  }
}
