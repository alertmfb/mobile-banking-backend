export interface StorageService {
  uploadFile(file: any, folder: string): Promise<string>;
  uploadBase64File?(base64: string, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  downloadFile?(fileKey: string, destPath: string): Promise<void>;
}
