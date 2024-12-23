import { v2 as cloudinary } from 'cloudinary';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage-service.interface';

export class Cloudinary implements StorageService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(file: any): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: this.configService.get<string>('CLOUDINARY_FOLDER'),
      });
      return result.secure_url;
    } catch (e) {
      throw new HttpException(
        'Cloudinary upload failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const publicId = fileUrl.split('/').pop()?.split('.')[0];
      await cloudinary.uploader.destroy(publicId!);
    } catch (e) {
      throw new HttpException(
        e.message + 'Cloudinary delete failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
