import { Sha256 } from '@aws-crypto/sha256-js';

export interface Env {
    HASH_KEY: string;
  }
  

export async function hashPassword(password: string, key: string): Promise<string> {
    const encodedPassword = new TextEncoder().encode(password);
    const hash = new Sha256(key);
    hash.update(encodedPassword);
    const result = await hash.digest();
    const hashArray = Array.from(new Uint8Array(result));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  
    return hashHex;
  }

export async function comparePassword(password: string, hashedPassword: string, key: string): Promise<boolean> {
  const candidateHash = await hashPassword(password, key);
  return candidateHash === hashedPassword;
}

