// custome error class from Error class
export class AppError extends Error {
  // readonly fields
  public readonly statusCode: number;
  public readonly status: 'fail' | 'error';
  public readonly isOperational: boolean;

  // constructor
  constructor(message: string, statusCode: number) {
    // inherite
    super(message);

    // setting context
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
