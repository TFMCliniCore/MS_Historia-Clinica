import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';

export const UPLOADS_DIR = './uploads';
export const MAX_FILES = 10;
export const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.match(/image\/(jpg|jpeg|png|webp|gif)/)) {
      return cb(
        new BadRequestException(
          `Tipo no permitido: ${file.mimetype}. Solo jpg, jpeg, png, webp, gif.`,
        ),
        false,
      );
    }
    cb(null, true);
  },
  limits: { fileSize: MAX_SIZE_BYTES },
};