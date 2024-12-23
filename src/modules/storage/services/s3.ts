import { HttpException, HttpStatus } from '@nestjs/common';
import {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ConfigService } from '@nestjs/config';
import { StorageService } from '../storage-service.interface';
import * as fs from 'fs';

export class S3Storage implements StorageService {
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  /**
   * Upload File to S3
   * @param file - File object
   * @returns URL of the uploaded file
   */
  async uploadFile(file: any): Promise<string> {
    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
          Key: `${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        },
      });

      const result = await upload.done();
      return result.Location;
    } catch (e) {
      throw new HttpException(
        `S3 upload failed: ${e.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Delete File from S3
   * @param fileUrl - S3 File URL
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
      const fileName = fileUrl.split('/').pop();

      const params = {
        Bucket: bucketName,
        Key: fileName!,
      };

      await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (e) {
      throw new HttpException(
        `S3 delete failed: ${e.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async downloadFile(fileKey: string, destPath: string): Promise<void> {
    try {
      const bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
      const params = { Bucket: bucketName, Key: fileKey };

      const command = new GetObjectCommand(params);
      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('No body returned from S3');
      }

      // Write the S3 Body stream directly to a file
      const writeStream = fs.createWriteStream(destPath);
      // response.Body.pipe(writeStream);

      // Wait until the stream is completely written
      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } catch (e) {
      throw new HttpException(
        `S3 download failed: ${e.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
