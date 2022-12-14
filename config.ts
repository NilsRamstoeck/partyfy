import { config as loadEnviroment } from 'dotenv';

loadEnviroment({ path: '.env.local' });

export const client_id = process.env.CLIENT_ID!;
export const client_secret =  process.env.CLIENT_SECRET!;
export const mongodb_user =  process.env.MONGODB_USER!;
export const mongodb_pass =  process.env.MONGODB_PASS!;
export const mongodb_host =  process.env.MONGODB_HOST!;
export const mongodb_port =  process.env.MONGODB_PORT!;
export const jwt_secret_key =  process.env.JWT_SECRET_KEY!;
export const token_header_key =  process.env.TOKEN_HEADER_KEY!;