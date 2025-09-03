import CryptoJS from 'crypto-js';
import { getConfig } from './config';



// Function to encrypt a string
export const encryptString = (plainText: string): string => {
  console.log('serect key:', getConfig().secretKey)
  return CryptoJS.AES.encrypt(plainText, getConfig().secretKey).toString();
};

// Function to decrypt a string
export const decryptString = (cipherText: string): string => {
  console.log('serect key:',getConfig().secretKey)
  const bytes = CryptoJS.AES.decrypt(cipherText, getConfig().secretKey);
  console.log("out1:", bytes, '\n', 'out2:', bytes.toString(CryptoJS.enc.Utf8))
  return bytes.toString(CryptoJS.enc.Utf8);
};
