export class CustomerError extends Error {
  code: number | string;
  statusCode: number | string;
  message: string;
  ref?: string;
  constructor(code?: number | string, message?: string, ref?: string) {
    super(`[${code}] ${message}`);
    this.code = code || 500;
    this.statusCode = code || 500;
    this.message = message || '';
    this.ref = ref;
    console.error(code, message);
  }
}
