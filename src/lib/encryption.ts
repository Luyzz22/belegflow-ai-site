import { createCipheriv, createDecipheriv, randomBytes, createHmac } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16; // Initialization vector length for AES

// AES Encryption function
export function encrypt(text: string, key: Buffer): { iv: Buffer, encryptedData: Buffer, tag: Buffer } {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encryptedData = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return { iv, encryptedData, tag };
}

// AES Decryption function
export function decrypt(encryptedData: Buffer, key: Buffer, iv: Buffer, tag: Buffer): string {
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    return decryptedData.toString('utf8');
}

// Function to create a hash
export function createHash(data: string): string {
    return createHmac('sha256', data).digest('hex');
}

// Function to create HMAC
export function createHmacSignature(data: string, secret: string): string {
    return createHmac('sha256', secret).update(data).digest('hex');
}