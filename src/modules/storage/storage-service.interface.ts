export interface StorageService {
  uploadFile(file: any): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  downloadFile?(fileKey: string, destPath: string): Promise<void>;
}
