const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al proceso de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí puedes exponer funciones seguras si necesitas comunicación con el main process
  // Por ahora no necesitamos ninguna, pero dejamos la estructura para futuro
  
  // Ejemplo:
  // getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  // showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options)
});

// Evitar que se ejecute código inseguro
window.addEventListener('DOMContentLoaded', () => {
  console.log('🔒 Preload script cargado');
});
