export class ErrorHandler {
  static handle(error, context = {}) {
    const errorObj = {
      id: 'err_' + Date.now(),
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date()
    };
    console.error(`[ERROR] ${error.message}`, context);
    return errorObj;
  }

  static createError(code, message, details = {}) {
    return {
      code,
      message,
      details,
      timestamp: new Date()
    };
  }

  static isError(obj) {
    return obj && (obj instanceof Error || typeof obj.message === 'string');
  }

  static getErrorMessage(error) {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'Unknown error';
  }

  static getErrorStack(error) {
    return error.stack || 'No stack trace';
  }
}

export default ErrorHandler;
