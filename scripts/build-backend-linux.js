const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🐧 Compilando backend para Linux...');

// ⚠️ VALIDACIÓN DE PLATAFORMA
if (process.platform !== 'linux') {
  console.error('\n❌ ERROR: Este script solo puede ejecutarse en Linux (o WSL).');
  console.error(`   Plataforma detectada: ${process.platform}`);
  console.error('   Si estás en WSL, asegúrate de estar usando el Node.js instalado en Linux, NO el de Windows.');
  console.error('   Ejecuta: "which node" en WSL para verificar. Debería ser algo como /usr/bin/node');
  process.exit(1);
}

try {
  const projectRoot = path.join(__dirname, '..', '..');
  const backendDir = path.join(projectRoot, 'backend');
  const desktopDir = path.join(__dirname, '..');
  const buildDir = path.join(desktopDir, 'build');
  const backendBuildDir = path.join(buildDir, 'backend');
  const distDir = path.join(backendBuildDir, 'dist');
  const workDir = path.join(backendBuildDir, 'work');
  const specDir = path.join(backendBuildDir, 'spec');

  // Crear directorios de build
  fs.mkdirSync(backendBuildDir, { recursive: true });
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(workDir, { recursive: true });
  fs.mkdirSync(specDir, { recursive: true });

  // Instalar dependencias del backend
  console.log('📦 Instalando dependencias del backend y PyInstaller...');
  // ⚠️ Usamos python3 -m pip y --break-system-packages para máxima compatibilidad en WSL/Linux
  execSync('python3 -m pip install -r requirements.txt pyinstaller --break-system-packages', {
    cwd: backendDir,
    stdio: 'inherit'
  });

  // Configurar PyInstaller para Linux
  const pyinstallerArgs = [
    '--onefile',
    '--name', 'backend',
    '--distpath', distDir,
    '--workpath', workDir,
    '--specpath', specDir,
    '--clean',
    '--noconfirm',
    // ⚠️ CRÍTICO: --collect-all para paquetes grandes
    '--collect-all', 'fastapi',
    '--collect-all', 'uvicorn',
    '--collect-all', 'pandas',
    '--collect-all', 'pydantic',
    // Hidden imports adicionales
    '--hidden-import', 'uvicorn.lifespan.on',
    '--hidden-import', 'uvicorn.lifespan.off',
    '--hidden-import', 'uvicorn.protocols.http.auto',
    '--hidden-import', 'uvicorn.protocols.websockets.auto',
    '--hidden-import', 'uvicorn.loops.auto',
    '--hidden-import', 'openpyxl',
    '--hidden-import', 'multipart',
    // Módulos de la app
    '--hidden-import', 'app',
    '--hidden-import', 'app.analyzer',
    '--hidden-import', 'app.utils',
    '--hidden-import', 'app.main',
    path.join(backendDir, 'app', 'main.py')
  ];

  console.log('🔨 Ejecutando PyInstaller para Linux...');
  const pyinstallerCmd = `python3 -m PyInstaller ${pyinstallerArgs.join(' ')}`;
  execSync(pyinstallerCmd, {
    cwd: backendDir,
    stdio: 'inherit'
  });

  // Mover el ejecutable a la ubicación final (sin extensión en Linux)
  const sourceExe = path.join(distDir, 'backend');
  const targetExe = path.join(backendBuildDir, 'backend');

  if (fs.existsSync(sourceExe)) {
    fs.copyFileSync(sourceExe, targetExe);
    console.log(`✅ Backend Linux compilado: ${targetExe}`);
  } else {
    throw new Error('❌ No se encontró el ejecutable backend');
  }

  // Limpiar directorio dist
  fs.rmSync(distDir, { recursive: true, force: true });

  console.log('\n🎉 Backend Linux compilado exitosamente');

} catch (error) {
  console.error('\n❌ Error al compilar backend Linux:', error.message);
  process.exit(1);
}
