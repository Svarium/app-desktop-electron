const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Configurar para manejar correctamente el DPI scaling en Windows
if (process.platform === 'win32') {
  app.commandLine.appendSwitch('high-dpi-support', 'true');
  app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

let mainWindow;
let backendProcess;

// Función para obtener la ruta del backend
function getBackendPath() {
  const isWin = process.platform === 'win32';
  const backendName = isWin ? 'backend.exe' : 'backend';

  if (app.isPackaged) {
    // Producción: resources/backend.exe o resources/backend
    return path.join(process.resourcesPath, backendName);
  } else {
    // Desarrollo: build/backend/backend.exe o build/backend/backend
    return path.join(__dirname, 'build', 'backend', backendName);
  }
}

// Función para obtener la ruta del frontend
function getFrontendPath() {
  if (app.isPackaged) {
    // Producción: resources/frontend/index.html
    return path.join(process.resourcesPath, 'frontend', 'index.html');
  } else {
    // Desarrollo: build/frontend/dist/index.html
    return path.join(__dirname, 'build', 'frontend', 'dist', 'index.html');
  }
}

// Función para obtener el directorio de logs
function getLogsDirectory() {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA, 'ReporteAutomatico', 'logs');
  } else if (process.platform === 'darwin') {
    return path.join(process.env.HOME, 'Library', 'Application Support', 'ReporteAutomatico', 'logs');
  } else {
    return path.join(process.env.HOME, '.config', 'ReporteAutomatico', 'logs');
  }
}

// Función para crear el directorio de logs
function ensureLogsDirectory() {
  const logsDir = getLogsDirectory();
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  return logsDir;
}

// Función para esperar a que el backend esté listo
async function waitForBackend(maxAttempts = 30, delay = 2000) {
  const axios = require('axios');

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get('http://127.0.0.1:8000/health', { timeout: 5000 });
      if (response.data.status === 'ok') {
        console.log('✅ Backend está listo');
        return true;
      }
    } catch (error) {
      console.log(`⏳ Intento ${i + 1}/${maxAttempts}: Backend no responde...`);
    }

    await new Promise(resolve => setTimeout(resolve, delay));
  }

  throw new Error('❌ Backend no respondió en el tiempo esperado');
}

// Función para iniciar el backend
function startBackend() {
  const backendPath = getBackendPath();
  const logsDir = ensureLogsDirectory();
  const logFile = path.join(logsDir, 'backend.log');

  console.log(`🚀 Iniciando backend: ${backendPath}`);

  // Verificar que el backend exista
  if (!fs.existsSync(backendPath)) {
    throw new Error(`❌ Backend no encontrado: ${backendPath}`);
  }

  // Crear stream de logs
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  // Iniciar proceso del backend
  backendProcess = spawn(backendPath, [], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  // Redirigir salida a logs
  backendProcess.stdout.pipe(logStream);
  backendProcess.stderr.pipe(logStream);

  // También mostrar en consola para desarrollo
  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend ERROR] ${data.toString().trim()}`);
  });

  backendProcess.on('error', (error) => {
    console.error('❌ Error al iniciar backend:', error);
    throw error;
  });

  backendProcess.on('close', (code) => {
    console.log(`🔚 Backend process exited with code ${code}`);
  });

  return backendProcess;
}

// Función para crear la ventana principal
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'build', 'icon.ico'),
    show: false
  });

  // Configurar zoom por defecto para que coincida con la versión web
  mainWindow.webContents.setZoomFactor(1.0);

  // Prevenir que el zoom cambie automáticamente al maximizar
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.setZoomFactor(1.0);
  });

  // Manejar cambio de tamaño para mantener zoom consistente
  mainWindow.on('resize', () => {
    setTimeout(() => {
      mainWindow.webContents.setZoomFactor(1.0);
    }, 100);
  });

  // Cargar el frontend
  const frontendPath = getFrontendPath();
  console.log(`📱 Cargando frontend: ${frontendPath}`);

  mainWindow.loadFile(frontendPath);

  // Mostrar la ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // En desarrollo, abrir DevTools
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Evento cuando la aplicación está lista
app.whenReady().then(async () => {
  try {
    console.log('🚀 Iniciando aplicación...');

    // Iniciar backend
    startBackend();

    // Esperar a que el backend esté listo
    await waitForBackend();

    // Crear y mostrar ventana principal
    createWindow();

    console.log('✅ Aplicación iniciada correctamente');

  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);

    // Mostrar mensaje de error con opción de ver logs
    const { dialog, shell } = require('electron');
    const logsDir = getLogsDirectory();

    const choice = dialog.showMessageBoxSync({
      type: 'error',
      title: 'Error de Inicio',
      message: `No se pudo iniciar la aplicación:\n\n${error.message}`,
      detail: 'Esto puede deberse a un conflicto con el puerto 8000 o a que el antivirus bloqueó el motor interno.',
      buttons: ['Ver Logs', 'Cerrar'],
      defaultId: 1
    });

    if (choice === 0) {
      shell.openPath(logsDir);
    }

    app.quit();
  }
});

// Evento cuando todas las ventanas están cerradas
app.on('window-all-closed', () => {
  // Cerrar el backend
  if (backendProcess) {
    console.log('🛑 Cerrando backend...');
    backendProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Manejar cierre forzado
process.on('SIGINT', () => {
  console.log('🛑 Recibido SIGINT, cerrando...');
  if (backendProcess) {
    backendProcess.kill();
  }
  app.quit();
});

process.on('SIGTERM', () => {
  console.log('🛑 Recibido SIGTERM, cerrando...');
  if (backendProcess) {
    backendProcess.kill();
  }
  app.quit();
});
