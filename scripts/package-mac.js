const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍎 Creando instalador para macOS...');

try {
  const desktopDir = path.join(__dirname, '..');
  
  // Verificar que estamos en macOS
  if (process.platform !== 'darwin') {
    throw new Error('❌ El empaquetado para macOS solo se puede realizar en una Mac');
  }
  
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

  console.log('🔨 Ejecutando electron-builder para macOS...');
  
  // Ejecutar electron-builder para macOS
  execSync('npx electron-builder --mac', { 
    cwd: desktopDir, 
    stdio: 'inherit'
  });

  // Verificar que el instalador se creó
  const distDir = path.join(desktopDir, 'dist');
  const dmgFiles = fs.readdirSync(distDir).filter(file => 
    file.endsWith('.dmg')
  );

  if (dmgFiles.length === 0) {
    throw new Error('❌ No se encontró el instalador .dmg generado');
  }

  console.log(`\n🎉 Instalador macOS creado exitosamente:`);
  dmgFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);
    console.log(`📁 ${file}: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  });
  
  console.log(`\n✅ Listo para distribuir en macOS!`);
  
} catch (error) {
  console.error('\n❌ Error al crear instalador macOS:', error.message);
  process.exit(1);
}
