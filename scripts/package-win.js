const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Creando instalador...');

try {
  const desktopDir = path.join(__dirname, '..');
  
  // Verificar que los builds existan
  const backendExe = path.join(desktopDir, 'build', 'backend', 'backend.exe');
  const frontendDist = path.join(desktopDir, 'build', 'frontend', 'dist');
  
  if (!fs.existsSync(backendExe)) {
    throw new Error(`❌ Backend no encontrado: ${backendExe}\n   Ejecuta primero: npm run build:backend`);
  }
  
  if (!fs.existsSync(frontendDist)) {
    throw new Error(`❌ Frontend no encontrado: ${frontendDist}\n   Ejecuta primero: npm run build:frontend`);
  }
  
  console.log('✅ Builds verificados');

  // Instalar dependencias de Electron si es necesario
  if (!fs.existsSync(path.join(desktopDir, 'node_modules'))) {
    console.log('📦 Instalando dependencias de Electron...');
    execSync('npm install', { 
      cwd: desktopDir, 
      stdio: 'inherit' 
    });
  }

  // Preparar variables de entorno sin code signing
  const env = {
    ...process.env,
    CSC_IDENTITY_AUTO_DISCOVERY: 'false'
  };

  // Eliminar variables relacionadas con code signing
  delete env.WIN_CSC_LINK;
  delete env.CSC_LINK;
  delete env.CSC_KEY_PASSWORD;
  delete env.CSC_NAME;

  console.log('🔨 Ejecutando electron-builder...');
  
  // Ejecutar electron-builder
  execSync('npx electron-builder --win', { 
    cwd: desktopDir, 
    stdio: 'inherit',
    env: env
  });

  // Verificar que el instalador se creó
  const distDir = path.join(desktopDir, 'dist');
  const installerFiles = fs.readdirSync(distDir).filter(file => 
    file.endsWith('.exe') && file.includes('Setup')
  );

  if (installerFiles.length === 0) {
    throw new Error('❌ No se encontró el instalador generado');
  }

  const installerPath = path.join(distDir, installerFiles[0]);
  const stats = fs.statSync(installerPath);
  
  console.log(`\n🎉 Instalador creado exitosamente:`);
  console.log(`📁 Archivo: ${installerPath}`);
  console.log(`📏 Tamaño: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`\n✅ Listo para distribuir!`);
  
} catch (error) {
  console.error('\n❌ Error al crear instalador:', error.message);
  
  // Sugerencias comunes
  if (error.message.includes('privilegio')) {
    console.log('\n💡 Sugerencia: Ejecuta la terminal como Administrador o habilita Modo Desarrollador');
  }
  
  if (error.message.includes('code signing')) {
    console.log('\n💡 Sugerencia: Verifica que electron-builder versión 23.6.0 esté instalado');
  }
  
  process.exit(1);
}
