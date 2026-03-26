export class StateStore {
  constructor(initialState = {}) {
    this.state = initialState;
    this.mutations = new Map();
    this.actions = new Map();
    this.subscribers = [];
  }

  getState() {
    return { ...this.state };
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  registerMutation(name, handler) {
    this.mutations.set(name, handler);
  }

  registerAction(name, handler) {
    this.actions.set(name, handler);
  }

  commit(mutationName, payload) {
    const handler = this.mutations.get(mutationName);
    if (!handler) throw new Error(`Mutation not found: ${mutationName}`);
    handler(this.state, payload);
    this.notify();
  }

  dispatch(actionName, payload) {
    const handler = this.actions.get(actionName);
    if (!handler) throw new Error(`Action not found: ${actionName}`);
    return handler({ state: this.state, commit: this.commit.bind(this) }, payload);
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.state));
  }
}

export default StateStore;
