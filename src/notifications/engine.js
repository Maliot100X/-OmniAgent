export class NotificationEngine {
  constructor() {
    this.notifications = [];
    this.subscribers = new Map();
  }

  notify(type, title, message, data = {}) {
    const notif = {
      id: 'notif_' + Date.now(),
      type,
      title,
      message,
      data,
      timestamp: new Date(),
      read: false
    };
    this.notifications.push(notif);
    this.broadcast(notif);
    return notif;
  }

  subscribe(userId, callback) {
    if (!this.subscribers.has(userId)) this.subscribers.set(userId, []);
    this.subscribers.get(userId).push(callback);
  }

  broadcast(notification) {
    this.subscribers.forEach((callbacks) => callbacks.forEach(cb => cb(notification)));
  }

  getNotifications(limit = 50) {
    return this.notifications.slice(-limit);
  }

  markAsRead(notifId) {
    const n = this.notifications.find(n => n.id === notifId);
    if (n) n.read = true;
    return { success: true };
  }

  clearNotifications() {
    this.notifications = [];
    return { success: true };
  }
}

export default NotificationEngine;
