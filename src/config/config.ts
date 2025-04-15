import dotenv from 'dotenv';

dotenv.config();

export const DEVELOPMENT = process.env.NODE_ENV === 'development';
export const TEST = process.env.NODE_ENV === 'test';

// Configuración del servidor local
export const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
export const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3000;
export const API_BASE_URL = process.env.SPORT_CLUB_API as string;


export const SERVER = { 
  SERVER_HOSTNAME, 
  SERVER_PORT, 
  API_BASE_URL,
};
