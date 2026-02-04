const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🧪 Probando backend compilado...');

try {
  const desktopDir = path.join(__dirname, '..');
  const backendPath = path.join(desktopDir, 'build', 'backend', 'backend.exe');

  // Verificar que el backend exista
  if (!fs.existsSync(backendPath)) {
    throw new Error(`❌ Backend no encontrado: ${backendPath}\n   Ejecuta primero: npm run build:backend`);
  }

  console.log(`🚀 Iniciando backend: ${backendPath}`);
  
  let backendProcess;
  let testPassed = false;

  // Función para limpiar
  function cleanup() {
    if (backendProcess) {
      console.log('🛑 Deteniendo backend...');
      backendProcess.kill();
    }
  }

  // Manejar cierre forzado
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Iniciar backend
  backendProcess = spawn(backendPath, [], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  let output = '';
  backendProcess.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    console.log(`[Backend] ${text.trim()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend ERROR] ${data.toString().trim()}`);
  });

  backendProcess.on('error', (error) => {
    console.error('❌ Error al iniciar backend:', error.message);
    cleanup();
    process.exit(1);
  });

  backendProcess.on('close', (code) => {
    console.log(`🔚 Backend process exited with code ${code}`);
    if (!testPassed) {
      console.log('❌ El backend se cerró antes de completar la prueba');
      process.exit(1);
    }
  });

  // Esperar un momento y luego probar el endpoint
  setTimeout(async () => {
    try {
      console.log('🔍 Probando conexión con el backend...');
      
      // Importar axios dinámicamente
      const axios = require('axios');
      
      const response = await axios.get('http://127.0.0.1:8000/health', { 
        timeout: 5000 
      });
      
      if (response.data && response.data.status === 'ok') {
        console.log('✅ Backend respondió correctamente!');
        testPassed = true;
        cleanup();
        
        // Esperar un momento a que el proceso se cierre
        setTimeout(() => {
          console.log('✅ El backend.exe funciona correctamente');
          process.exit(0);
        }, 1000);
      } else {
        throw new Error('Respuesta inválida del backend');
      }
      
    } catch (error) {
      console.error('❌ Error al conectar con el backend:', error.message);
      cleanup();
      process.exit(1);
    }
  }, 3000); // Esperar 3 segundos

} catch (error) {
  console.error('❌ Error en la prueba:', error.message);
  process.exit(1);
}
