
import cloudinary from 'cloudinary';
import fs from 'fs';
import pathLibrary from 'path';
import config from '../../../config';
import sharp from 'sharp';

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
      .on('finish', () => {
        resolve(resizeImage(path));
      })
  )
}

export const validateImage = (filename, path) => {
  const ext = pathLibrary.extname(filename).toLowerCase();
  if (config.allowedImageFormat.indexOf(ext) === -1) {
    fs.unlinkSync(path);
    throw new Error('Only images are allowed');
  }
}

export const resizeImage = (path) => {
  const name = path.match(/\/(\w+)\.(\w+)/)[1];
  const extension = path.match(/\/(\w+)\.(\w+)/)[2];
  const newName = `${config.uploadsFolder}${name}2.${extension}`;
  return new Promise((resolve, reject) =>
  sharp(path)
    .resize(config.imageSize)
    .toFile(newName, (error) => {
      if(error){
        reject(error);
      }else{
        fs.unlinkSync(path);
        resolve({path: newName});
      }
    })
  )
}
