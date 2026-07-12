//* App Error

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    // error code and status
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // to identify this error is from our expected error or not
    this.isOperational = true;

    // for better error msg
    Error.captureStackTrace(this, this.constructor);
  }
}
