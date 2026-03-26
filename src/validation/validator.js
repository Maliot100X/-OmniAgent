export class Validator {
  static isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static isUrl(url) {
    try { new URL(url); return true; } catch { return false; }
  }

  static isPhoneNumber(phone) {
    return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
  }

  static isJson(str) {
    try { JSON.parse(str); return true; } catch { return false; }
  }

  static isEmpty(value) {
    return !value || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);
  }

  static isString(value) {
    return typeof value === 'string';
  }

  static isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }

  static isArray(value) {
    return Array.isArray(value);
  }

  static isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  static validate(data, schema) {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      if (rules.required && this.isEmpty(data[field])) {
        errors.push(`${field} is required`);
      }
      if (rules.type && typeof data[field] !== rules.type) {
        errors.push(`${field} must be ${rules.type}`);
      }
      if (rules.email && !this.isEmail(data[field])) {
        errors.push(`${field} must be valid email`);
      }
    }
    return { valid: errors.length === 0, errors };
  }
}

export default Validator;
