import { v2 as cloudinary } from 'cloudinary';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage-service.interface';
import { Readable } from 'stream';

export class Cloudinary implements StorageService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadBase64File(base64: string, folder: string): Promise<string> {
    try {
      let cloudinaryFolder =
        this.configService.get<string>('CLOUDINARY_FOLDER') + '/' + folder;
      cloudinaryFolder = cloudinaryFolder
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/--/g, '-');

      const result = await cloudinary.uploader.upload(base64, {
        folder: cloudinaryFolder,
      });
      return result.secure_url;
    } catch (e) {
      throw new HttpException(
        'Cloudinary upload failed: ' + e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async uploadFile(file: any, folder: string): Promise<string> {
    try {
      let cloudinaryFolder =
        this.configService.get<string>('CLOUDINARY_FOLDER') + '/' + folder;
      cloudinaryFolder = cloudinaryFolder
        .replace(/[^a-zA-Z0-9]/g, '')
        .replace(/--/g, '-');

      // Use a stream to upload the buffer directly
      const result = await this.uploadToCloudinary(
        file.buffer,
        cloudinaryFolder,
      );
      // console.log(result);
      return result.secure_url;
    } catch (e) {
      throw new HttpException(
        'Cloudinary upload failed: ' + e.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async uploadToCloudinary(
    buffer: Buffer,
    folder: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      );

      // Create a readable stream from the buffer
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(stream);
    });
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
