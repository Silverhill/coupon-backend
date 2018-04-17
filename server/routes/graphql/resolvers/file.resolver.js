
import cloudinary from 'cloudinary';

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
