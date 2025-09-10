import dotenv from "dotenv";
dotenv.config();
export const mongoURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_NAME}.jhypi.mongodb.net/${process.env.COLLECTION_NAME}?retryWrites=true&w=majority`;
export const secretKey = process.env.SECRET_KEY||'';
export const defaultUsers =process.env.DEFAULT_USERS||[''];