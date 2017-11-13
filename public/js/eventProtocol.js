export default class EventProtocol {

  constructor() {
    this.listeners = new Map();

    // aliases
    this.on = this.addListener;
  }

  addListener(key, handler) {

    if(typeof handler !== 'function')
      return false;

    const listenerList = this.listeners.get(key) || [];
    listenerList.push(handler);
    this.listeners.set(key, listenerList);

    return true; // success

  }

  execListeners(key, info) {
    const listenerList = this.listeners.get(key) || [];
    for(let listener of listenerList)
      listener(info);
  }

  removeListener(key, handler) {
    const listenerList = this.listeners.get(key) || [];
    const indexOf = listenerList.indexOf(handler);
    if(indexOf === -1) return false; // failure
    listenerList.splice(indexOf, 1);
    return true; // success
  }

}