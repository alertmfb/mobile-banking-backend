import { Controller, Inject } from '@nestjs/common';
import { StorageService } from './storage-service.interface';

@Controller()
export class StorageController {
  constructor(
    @Inject('StorageService') private readonly storageService: StorageService,
  ) {}
}
