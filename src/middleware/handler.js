export class MiddlewareHandler {
  constructor() {
    this.middlewares = [];
  }

  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  async execute(request) {
    let context = { request, response: null };
    for (const middleware of this.middlewares) {
      context = await middleware(context);
      if (context.stop) break;
    }
    return context;
  }

  static auth(context) {
    if (!context.request.token) context.error = 'Unauthorized';
    return context;
  }

  static logger(context) {
    console.log(`[${new Date().toISOString()}] ${context.request.method} ${context.request.path}`);
    return context;
  }

  static errorHandler(context) {
    if (context.error) {
      context.response = { error: context.error, status: 400 };
      context.stop = true;
    }
    return context;
  }

  static corsHandler(context) {
    context.headers = { 'Access-Control-Allow-Origin': '*' };
    return context;
  }

  static rateLimitHandler(context) {
    context.rateLimited = false;
    return context;
  }
}

export default MiddlewareHandler;
