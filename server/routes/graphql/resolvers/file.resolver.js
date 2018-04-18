
import cloudinary from 'cloudinary';
import fs from 'fs';
import config from '../../../config';

export const uploadFile = async (parent, { file }) => {
  const { filename } = await file

  return await cloudinary.v2.uploader.upload(filename, (error, result) => {
    if (result) {
      return result;
    } else if (error) {
      return error;
    }
  });
};

export const storeFile = ({ stream, filename }) => {
  const path = `${config.uploadsFolder}${filename}`;
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated)
          // Delete the truncated file
          fs.unlinkSync(path)
        reject(error)
      })
      .pipe(fs.createWriteStream(path))
      .on('error', error => reject(error))
      .on('finish', () => resolve({ path }))
  )
}
