/**
 * @fileoverview Interfaz del adaptador para el almacenamiento de archivos físicos.
 * @author Cesar Gonzalez
 * @date 23/06/2026
 * @requirement RF2: Gestión Integral del Perfil del Profesional y Portafolio
 */

export abstract class IStorageAdapter {
  /**
   * Saves a file to the storage system and returns the access URL.
   * @param fileBuffer The raw bytes of the file.
   * @param fileName The original file name.
   * @param mimeType The file's mime type (e.g. image/jpeg).
   * @returns A promise resolving to the final accessible URL.
   */
  abstract saveFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;

  /**
   * Deletes a file from the storage system given its access URL.
   * @param fileUrl The URL of the file to delete.
   */
  abstract deleteFile(fileUrl: string): Promise<void>;
}
