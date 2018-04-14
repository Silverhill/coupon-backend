import jwt from 'jsonwebtoken';
import config from '../config';

export const extractUserIdFromToken = async (token) => {
  try {
    const { _id } = await jwt.verify(token, config.secrets.session);
    return _id;
  } catch (error) {
    return null;
  }
}
