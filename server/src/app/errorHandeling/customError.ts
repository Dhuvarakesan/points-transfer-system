export class CustomError extends Error {
  statusCode: number;
  errorCode: string;
  errorMessage: string;

  constructor(message: string, statusCode: number, errorCode: string, errorMessage: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;

    // Set the prototype explicitly to maintain the instanceof check
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}