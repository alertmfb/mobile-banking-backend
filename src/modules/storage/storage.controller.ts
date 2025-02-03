import { Controller, Inject } from '@nestjs/common';
import { StorageService } from './storage-service.interface';

@Controller()
export class StorageController {
  constructor(
    @Inject('StorageProvider') private readonly storageService: StorageService,
  ) {}
}
