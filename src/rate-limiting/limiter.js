export class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    if (!this.requests.has(key)) {
      this.requests.set(key, [now]);
      return true;
    }

    const times = this.requests.get(key);
    const validTimes = times.filter(t => now - t < this.windowMs);
    
    if (validTimes.length < this.maxRequests) {
      validTimes.push(now);
      this.requests.set(key, validTimes);
      return true;
    }
    return false;
  }

  getStatus(key) {
    const now = Date.now();
    const times = this.requests.get(key) || [];
    const validTimes = times.filter(t => now - t < this.windowMs);
    return {
      allowed: validTimes.length < this.maxRequests,
      current: validTimes.length,
      limit: this.maxRequests,
      resetIn: this.windowMs
    };
  }

  reset(key = null) {
    if (key) this.requests.delete(key);
    else this.requests.clear();
    return { success: true };
  }
}

export default RateLimiter;
