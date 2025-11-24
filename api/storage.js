// Shared storage between upload and raw functions
export let storage = {};

export function getStorage() {
  return storage;
}

export function setStorage(data) {
  storage = data;
}

export function addScript(name, data) {
  storage[name] = data;
}

export function getScript(name) {
  return storage[name];
}
