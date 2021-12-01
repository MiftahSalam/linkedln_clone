import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

import * as fs from 'fs';
import * as fileType from 'file-type';

import path = require('path');
import { from, Observable, of, switchMap } from 'rxjs';
import { FileTypeResult } from 'file-type/core';

type validFileExtension = 'png' | 'jpg' | 'jpeg';
type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

const validFileExtensions: validFileExtension[] = ['png', 'jpg', 'jpeg'];
const validMimeTypes: validMimeType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

export const saveImageToStorage = {
  storage: diskStorage({
    destination: './images',
    filename: (req, file, cb) => {
      // console.log("helpers-image-storage-saveImageToStorage-storage filename",file.originalname);

      const fileExtension: string = path.extname(file.originalname);
      const fileName: string = uuidv4() + fileExtension;

      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeType: validMimeType[] = validMimeTypes;
    // console.log("helpers-image-storage-saveImageToStorage-fileFilter file.mimeType",file.mimetype);

    allowedMimeType.includes(file.mimetype) ? cb(null, true) : cb(null, false);
  },
};

export const isFileExtensionSafe = (
  fullFilePath: string,
): Observable<boolean> => {
  // console.log("auth-helperd-image-storage-isFileExtensionSafe fullFilePath",fullFilePath);

  return from(fileType.fromFile(fullFilePath)).pipe(
    switchMap((fileExtensionAndMimeType: FileTypeResult) => {
      if (!fileExtensionAndMimeType) return of(false);

    //   console.log(
    //     'auth-helper-image-storage-isFileExtensionSafe fileExtensionAndMimeType',
    //     fileExtensionAndMimeType,
    //   );
      const ext = fileExtensionAndMimeType.ext.toString();
      const mime = fileExtensionAndMimeType.mime.toString();
      const isFileTypeLegit = validFileExtensions.find((validType) => ext === validType) ? true : false;
      const isMimeTypeLegit = validMimeTypes.find((validType) => mime === validType) ? true : false;
      const isFileLegit = isFileTypeLegit && isMimeTypeLegit;
    

      return of(isFileLegit);
    }),
  );
};

export const removeFile = (fullFilePath: string): void => {
  try {
    fs.unlinkSync(fullFilePath);
  } catch (error) {
    console.error(error);
  }
};
