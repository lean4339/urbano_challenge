import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { ContentModule } from '../content/content.module'; // Importar ContentModule

@Module({
  imports: [
    ContentModule, // Agregar ContentModule para poder usar ContentService
  ],
  controllers: [UploadController],
})
export class UploadModule {}
