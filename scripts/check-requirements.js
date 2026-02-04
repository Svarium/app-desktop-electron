const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando requisitos...');

try {
  // Verificar Node.js
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);

  // Verificar npm
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm: ${npmVersion}`);

  // Verificar Python
  const pythonVersion = execSync('python --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Python: ${pythonVersion}`);

  // Verificar PyInstaller
  try {
    const pyinstallerVersion = execSync('python -m PyInstaller --version', { encoding: 'utf8' }).trim();
    console.log(`✅ PyInstaller: ${pyinstallerVersion}`);
  } catch (error) {
    console.log('❌ PyInstaller no encontrado. Instalando...');
    execSync('pip install pyinstaller', { stdio: 'inherit' });
    console.log('✅ PyInstaller instalado');
  }

  // Verificar estructura del proyecto
  const backendDir = path.join(__dirname, '..', '..', 'backend');
  const frontendDir = path.join(__dirname, '..', '..', 'frontend');
  
  if (!fs.existsSync(backendDir)) {
    throw new Error(`❌ Directorio backend no encontrado: ${backendDir}`);
  }
  console.log('✅ Directorio backend encontrado');

  if (!fs.existsSync(frontendDir)) {
    throw new Error(`❌ Directorio frontend no encontrado: ${frontendDir}`);
  }
  console.log('✅ Directorio frontend encontrado');

  // Verificar requirements.txt
  const requirementsPath = path.join(backendDir, 'requirements.txt');
  if (!fs.existsSync(requirementsPath)) {
    throw new Error(`❌ requirements.txt no encontrado: ${requirementsPath}`);
  }
  console.log('✅ requirements.txt encontrado');

  console.log('\n🎉 Todos los requisitos verificados correctamente');
  
} catch (error) {
  console.error('\n❌ Error en la verificación:', error.message);
  process.exit(1);
}
