import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

const MAX_PROFILE_PICTURE_SIZE_IN_BYTES = 5 * 1024 * 1024;

export const FILE_INTERCEPTOR = FileInterceptor('file', {
  storage: diskStorage({
    destination: 'public/',
    filename: (req, file, cb) => {
      cb(
        null,
        new Date().getTime().toString() + '.' + file.mimetype.split('/')[1],
      );
    },
  }),
});

export const PIPE_BUILDER = new ParseFilePipeBuilder()
  .addMaxSizeValidator({ maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES })
  .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
  .build({
    fileIsRequired: false,
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  });
