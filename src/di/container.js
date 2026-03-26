export class DIContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  register(name, factory, singleton = false) {
    this.services.set(name, { factory, singleton });
    return this;
  }

  resolve(name) {
    if (!this.services.has(name)) throw new Error(`Service not found: ${name}`);
    const { factory, singleton } = this.services.get(name);

    if (singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, factory(this));
      }
      return this.singletons.get(name);
    }
    return factory(this);
  }

  has(name) {
    return this.services.has(name);
  }

  remove(name) {
    this.services.delete(name);
    this.singletons.delete(name);
  }

  clear() {
    this.services.clear();
    this.singletons.clear();
  }

  getServices() {
    return Array.from(this.services.keys());
  }
}

export default DIContainer;
