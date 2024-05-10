import {
  ForbiddenException,
  Injectable,
  PayloadTooLargeException,
  PipeTransform,
} from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 5 * 1024 * 1024;

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<string>>
{
  constructor(private readonly size = 1000) {}
  async transform(file: Express.Multer.File): Promise<string> {
    if (!file) return undefined;

    if (file.size > MAX_PROFILE_PICTURE_SIZE_IN_BYTES) {
      throw new PayloadTooLargeException('Le fichier ne doit pas dépasser 5Mb');
    }

    const extension = file.mimetype.split('/')[1];
    if (extension !== 'jpg' && extension !== 'jpeg' && extension !== 'png') {
      throw new ForbiddenException(
        "L'image doit être au format jgp, jpeg ou png",
      );
    }

    const filename = new Date().getTime().toString() + '.' + extension;
    const filePath = path.join('public', filename);

    await sharp(file.buffer).resize({ width: this.size }).toFile(filePath);

    return '/' + filePath;
  }
}
