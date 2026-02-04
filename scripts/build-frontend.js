const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 Compilando frontend...');

try {
  const projectRoot = path.join(__dirname, '..', '..');
  const frontendDir = path.join(projectRoot, 'frontend');
  const desktopDir = path.join(__dirname, '..');
  const buildDir = path.join(desktopDir, 'build');
  const frontendBuildDir = path.join(buildDir, 'frontend');
  const distDir = path.join(frontendBuildDir, 'dist');

  // Crear directorios de build
  fs.mkdirSync(frontendBuildDir, { recursive: true });
  fs.mkdirSync(distDir, { recursive: true });

  // Instalar dependencias del frontend
  console.log('📦 Instalando dependencias del frontend...');
  execSync('npm install', { 
    cwd: frontendDir, 
    stdio: 'inherit' 
  });

  // Compilar frontend con Vite
  console.log('🔨 Ejecutando Vite build...');
  execSync('npm run build', { 
    cwd: frontendDir, 
    stdio: 'inherit' 
  });

  // Copiar archivos compilados al directorio de build
  const sourceDist = path.join(frontendDir, 'dist');
  console.log(`📁 Copiando archivos de ${sourceDist} a ${distDir}`);

  // Función para copiar directorio recursivamente
  function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    
    if (isDirectory) {
      fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach(childItemName => {
        copyRecursiveSync(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        );
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  copyRecursiveSync(sourceDist, distDir);

  // Verificar que index.html exista y tenga rutas relativas
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('❌ No se encontró index.html en el build');
  }

  const indexContent = fs.readFileSync(indexPath, 'utf8');
  if (indexContent.includes('src="/assets/')) {
    console.warn('⚠️ ADVERTENCIA: Se encontraron rutas absolutas en index.html');
    console.warn('   Asegúrate de que vite.config.js tenga base: "./"');
  } else {
    console.log('✅ index.html tiene rutas relativas');
  }

  console.log(`✅ Frontend compilado: ${distDir}`);
  console.log('\n🎉 Frontend compilado exitosamente');
  
} catch (error) {
  console.error('\n❌ Error al compilar frontend:', error.message);
  process.exit(1);
}
