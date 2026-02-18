const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  startLoop: () => ipcRenderer.invoke('start-loop'),
  stopLoop: () => ipcRenderer.invoke('stop-loop'),
  onUpdate: (cb) => ipcRenderer.on('update', (_e, data) => cb(data)),
  onStopped: (cb) => ipcRenderer.on('stopped', () => cb()),
});
