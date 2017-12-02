
export default class PracticalStorage {

  constructor(options = {}) {

    this.storageTool = localStorage;

    const { type } = options;
    switch(type) {
      case 'local':
        this.storageTool = localStorage;
        break;
      case 'session':
        this.storageTool = sessionStorage;
        break;
    }

  }

  write(key, obj) {
    if(!this.storageIsViable()) return false;

    const str = JSON.stringify(obj);
    this.storageTool.setItem(key, str);
    return true;
  }

  read(key) {
    if(!this.storageIsViable()) return false;

    const str = this.storageTool.getItem(key);
    return JSON.parse(str);
  }

  clear(key) {
    if(!this.storageIsViable()) return false;

    this.storageTool.removeItem(key);
    return true;
  }

  storageIsViable() {
    const test = 'test';
    try {
      this.storageTool.setItem(test, test);
      this.storageTool.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  }

}
