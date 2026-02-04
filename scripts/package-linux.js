const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🐧 Creando instalador para Linux...');

try {
  const desktopDir = path.join(__dirname, '..');
  
  // Compilar backend para Linux
  console.log('🔧 Compilando backend para Linux...');
  execSync('node scripts/build-backend-linux.js', { 
    cwd: desktopDir, 
    stdio: 'inherit' 
  });
  
  // Verificar que los builds existan
  const backendExe = path.join(desktopDir, 'build', 'backend', 'backend');
  const frontendDist = path.join(desktopDir, 'build', 'frontend', 'dist');
  
  if (!fs.existsSync(backendExe)) {
    throw new Error(`❌ Backend Linux no encontrado: ${backendExe}`);
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

  console.log('🔨 Ejecutando electron-builder para Linux...');
  
  // Ejecutar electron-builder para Linux
  execSync('npx electron-builder --linux', { 
    cwd: desktopDir, 
    stdio: 'inherit'
  });

  // Verificar que los instaladores se crearon
  const distDir = path.join(desktopDir, 'dist');
  const files = fs.readdirSync(distDir).filter(file => 
    file.endsWith('.AppImage') || file.endsWith('.deb')
  );

  if (files.length === 0) {
    throw new Error('❌ No se encontraron los instaladores generados');
  }

  console.log(`\n🎉 Instaladores Linux creados exitosamente:`);
  files.forEach(file => {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);
    console.log(`📁 ${file}: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  });
  
  console.log(`\n✅ Listo para distribuir en Linux!`);
  
} catch (error) {
  console.error('\n❌ Error al crear instalador Linux:', error.message);
  process.exit(1);
}
