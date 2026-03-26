export class Transformer {
  static toJSON(data) {
    return JSON.stringify(data);
  }

  static fromJSON(json) {
    return JSON.parse(json);
  }

  static toCSV(data) {
    if (!Array.isArray(data) || data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(h => obj[h]).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  static flatten(obj, prefix = '') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, this.flatten(value, newKey));
      } else {
        result[newKey] = value;
      }
    }
    return result;
  }

  static unflatten(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const keys = key.split('.');
      let current = result;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
    }
    return result;
  }

  static mapArray(arr, mapper) {
    return arr.map(mapper);
  }

  static filterArray(arr, predicate) {
    return arr.filter(predicate);
  }

  static groupBy(arr, key) {
    return arr.reduce((acc, obj) => {
      const group = obj[key];
      if (!acc[group]) acc[group] = [];
      acc[group].push(obj);
      return acc;
    }, {});
  }
}

export default Transformer;
