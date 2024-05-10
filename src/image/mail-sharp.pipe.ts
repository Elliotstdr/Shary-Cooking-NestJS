import {
  ForbiddenException,
  Injectable,
  PayloadTooLargeException,
  PipeTransform,
} from '@nestjs/common';
import * as sharp from 'sharp';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 5 * 1024 * 1024;

export type MailPayload = {
  image: string;
  buffer: Buffer;
};

@Injectable()
export class MailSharpPipe
  implements PipeTransform<Express.Multer.File, Promise<MailPayload>>
{
  async transform(image: Express.Multer.File): Promise<MailPayload> {
    if (!image) return undefined;

    if (image.size > MAX_PROFILE_PICTURE_SIZE_IN_BYTES) {
      throw new PayloadTooLargeException('Le fichier ne doit pas dépasser 5Mb');
    }

    const extension = image.mimetype.split('/')[1];
    if (extension !== 'jpg' && extension !== 'jpeg' && extension !== 'png') {
      throw new ForbiddenException(
        "L'image doit être au format jgp, jpeg ou png",
      );
    }

    const buffer = await sharp(image.buffer).resize({ width: 500 }).toBuffer();
    return { image: image.originalname, buffer };
  }
}
