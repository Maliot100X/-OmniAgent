export class Router {
  constructor(basePath = '') {
    this.basePath = basePath;
    this.routes = { GET: {}, POST: {}, PUT: {}, DELETE: {}, PATCH: {} };
  }

  get(path, handler) {
    this.routes.GET[this.basePath + path] = handler;
  }

  post(path, handler) {
    this.routes.POST[this.basePath + path] = handler;
  }

  put(path, handler) {
    this.routes.PUT[this.basePath + path] = handler;
  }

  delete(path, handler) {
    this.routes.DELETE[this.basePath + path] = handler;
  }

  patch(path, handler) {
    this.routes.PATCH[this.basePath + path] = handler;
  }

  match(method, path) {
    return this.routes[method][path] || null;
  }

  listRoutes() {
    const routes = [];
    for (const [method, paths] of Object.entries(this.routes)) {
      for (const path of Object.keys(paths)) {
        routes.push(`${method} ${path}`);
      }
    }
    return routes;
  }

  getRouteCount() {
    return this.listRoutes().length;
  }
}

export default Router;
