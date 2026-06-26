/**
 * @fileoverview Implementación concreta de IStorageAdapter para persistir archivos en el sistema de archivos local.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

import { Injectable } from '@nestjs/common';
import { IStorageAdapter } from '../../domain/adapters/IStorageAdapter';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageAdapter implements IStorageAdapter {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Create the upload directory if it doesn't exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
    const filePath = path.join(this.uploadDir, uniqueFileName);

    await fs.promises.writeFile(filePath, fileBuffer);

    // Return the relative URL path for the client
    return `/uploads/${uniqueFileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Extract file name if it matches the prefix
    if (fileUrl.startsWith('/uploads/')) {
      const fileName = fileUrl.replace('/uploads/', '');
      const filePath = path.join(this.uploadDir, fileName);

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
  }
}
