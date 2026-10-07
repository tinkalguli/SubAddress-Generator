const ALPHANUM = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomBytes(length: number): Uint8Array {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return arr;
}

export function randomString(length: number): string {
  if (length <= 0) return '';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHANUM[bytes[i]! % ALPHANUM.length];
  }
  return result;
}

export function random4(): string {
  return randomString(4);
}

export function random6(): string {
  return randomString(6);
}
