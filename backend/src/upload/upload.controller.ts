import { Controller, Get, Param, NotFoundException, Post, Req, Res} from '@nestjs/common';
import { createReadStream, promises as fs } from 'fs';
import { extname, join } from 'path';
import { ContentService } from '../content/content.service';
@Controller('uploads')
export class UploadController {
  
  constructor(private readonly contentService: ContentService) {}

  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res) {
    const filePath = join('/app/uploads', filename); // 🚀 Ruta fija en Docker

    try {
      // ✅ Verificar si el archivo existe antes de enviarlo
      await fs.access(filePath);

      const ext = extname(filename).toLowerCase();
      let mimeType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.gif') mimeType = 'image/gif';

      res.setHeader('Content-Type', mimeType);
      const fileStream = createReadStream(filePath);
      fileStream.pipe(res); // ✅ Envía la imagen correctamente
    } catch (error) {
      console.error("❌ Error cargando la imagen:", error);
      throw new NotFoundException('Imagen no encontrada');
    }
  }
  @Post('image/:contentId')
  async uploadImage(@Param('contentId') contentId: string, @Req() req): Promise<{ message: string; imageUrl: string }> {
    return new Promise((resolve, reject) => {
      const chunks = [];
      const uploadDir = join(__dirname, '..', '..', 'uploads');
      let filename = `content-${contentId}-${Date.now()}.jpg`;
      let originalExtension = 'jpg'; // Default to jpg
      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', async () => {
        const buffer = Buffer.concat(chunks);

        try {
          const filenameHeader = req.headers['x-filename']; // Expect frontend to send this
          if (filenameHeader) {
            originalExtension = extname(filenameHeader).slice(1); // Remove dot
          }
          if (!['jpg', 'jpeg', 'png', 'gif'].includes(originalExtension)) {
            throw new Error("Unsupported file format");
          }

          // 🔥 Generate filename with correct extension
          const filename = `content-${contentId}-${Date.now()}.${originalExtension}`;
          const filePath = join(uploadDir, filename);
          await fs.writeFile(filePath, buffer);
          const imageUrl = `/uploads/${filename}`;

          // Guardar la URL en la base de datos
          await this.contentService.updateContentImage(contentId, imageUrl);

          resolve({ message: 'Imagen subida con éxito', imageUrl });
        } catch (error) {
          console.log(error);
          reject(new NotFoundException('Error al guardar la imagen'));
        }
      });

      req.on('error', (err) => reject(err));
    });
  }
}
