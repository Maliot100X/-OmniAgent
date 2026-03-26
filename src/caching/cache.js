export class CacheManager {
  constructor(ttl = 3600000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value, ttl = this.ttl) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
    return { success: true };
  }

  get(key) {
    if (!this.cache.has(key)) return null;
    const item = this.cache.get(key);
    if (item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
    return { success: true };
  }

  clear() {
    this.cache.clear();
    return { success: true };
  }

  getSize() {
    return this.cache.size;
  }

  getStats() {
    return {
      size: this.cache.size,
      ttl: this.ttl,
      entries: Array.from(this.cache.entries()).map(([k, v]) => ({ key: k, ttl: v.expiry - Date.now() }))
    };
  }
}

export default CacheManager;
