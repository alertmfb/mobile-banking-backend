import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage-service.interface';
import { Cloudinary } from './services/cloudinary';
import { S3Storage } from './services/s3';

export const StorageServiceProvider: Provider = {
  provide: 'StorageService',
  useFactory: (configService: ConfigService): StorageService => {
    const storageProvider =
      configService.get<string>('STORAGE_PROVIDER') || 'cloudinary';
    switch (storageProvider) {
      case 'cloudinary':
        return new Cloudinary(configService);
      case 's3':
        return new S3Storage(configService);
      default:
        throw new Error(`Unsupported storage provider: ${storageProvider}`);
    }
  },
  inject: [ConfigService],
};
