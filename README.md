# 📊 Reporte Automático - Desktop App

Aplicación desktop multiplataforma que empaqueta el backend Python (FastAPI) y frontend React (Vite) en una sola aplicación instalable.

---

## 🏗️ **Arquitectura**

```
desktop/
├── main.js              # Proceso principal de Electron
├── preload.js            # Script de seguridad
├── package.json          # Configuración y dependencias
├── scripts/              # Scripts de build y empaquetado
│   ├── check-requirements.js
│   ├── build-backend.js
│   ├── build-frontend.js
│   ├── build-backend-linux.js
│   ├── test-backend.js
│   ├── package-win.js
│   ├── package-linux.js
│   └── package-mac.js
└── build/                # Archivos compilados
    ├── backend/
    │   └── backend.exe   # Backend compilado (Windows)
    └── frontend/
        └── dist/         # Frontend compilado
```

---

## 🚀 **Funcionamiento**

### **Flujo de ejecución:**
1. **Electron inicia** → Ejecuta `main.js`
2. **Backend auto-inicia** → `backend.exe` se ejecuta como proceso hijo
3. **Health check** → Electron espera respuesta de `http://127.0.0.1:8000/health`
4. **Frontend carga** → Se muestra la interfaz React
5. **Comunicación** → Frontend se comunica con backend vía HTTP

### **Características clave:**
- ✅ **Auto-inicio backend** con uvicorn
- ✅ **Zoom consistente** al maximizar/restaurar
- ✅ **DPI scaling controlado** en Windows
- ✅ **Logs centralizados** en `%APPDATA%\ReporteAutomatico\logs\`
- ✅ **Tamaño mínimo** para evitar layouts rotos
- ✅ **Multiplataforma** (Windows, Linux, macOS)

---

## 📋 **Requisitos**

### **Para desarrollo:**
- **Node.js** v24+ 
- **Python** v3.12+
- **PyInstaller** (`pip install pyinstaller`)
- **npm** (incluido con Node.js)

### **Para ejecutar instalador:**
- **Windows:** Windows 10+ (x64)
- **Linux:** Ubuntu 20.04+ / Debian 10+ (x64)
- **macOS:** macOS 10.15+ (Intel + Apple Silicon)

---

## 🛠️ **Comandos Disponibles**

### **🔍 Verificación y Setup**
```bash
# Verificar todos los requisitos
npm run check

# Instalar dependencias de Electron
npm install
```

### **🏗️ Compilación**
```bash
# Compilar backend (Windows)
npm run build:backend

# Compilar frontend
npm run build:frontend

# Compilar todo (backend + frontend)
npm run build:all
```

### **🧪 Testing**
```bash
# Probar backend compilado
npm run test:backend

# Iniciar aplicación en desarrollo
npm start

# Iniciar con DevTools
npm run dev
```

### **📦 Empaquetado Multiplataforma**

#### **Windows (desde Windows):**
```bash
npm run package:win
# Genera: dist/Reporte Automático Setup 1.0.0.exe
```

#### **Linux (desde WSL o Linux nativo):**
> [!IMPORTANT]
> PyInstaller no permite compilación cruzada. Para generar el binario de Linux, **debes** estar en un entorno Linux. En Windows, lo más sencillo es usar **WSL**.

1. **Configurar WSL (si no lo tienes):**
   ```bash
   # En PowerShell como Admin:
   wsl --install
   ```
2. **Instalar dependencias en WSL (Ubuntu):**
   ```bash
   sudo apt update
   sudo apt install -y python3 python3-pip nodejs npm
   ```
3. **Empaquetar:**
   ```bash
   # Dentro de la terminal de WSL:
   cd /mnt/c/Users/MICHICOMPU/Desktop/Reporte-automatico/desktop
   npm run package:linux
   ```
# Genera: 
# - dist/Reporte-Automático-1.0.0.AppImage (Portable)
# - dist/reporte-automatico-desktop_1.0.0_amd64.deb (Instalador Ubuntu/Debian)

#### **macOS (solo desde Mac):**
```bash
npm run package:mac
# Genera: dist/Reporte Automático-1.0.0.dmg (Intel + Apple Silicon)
```

#### **Todos los instaladores:**
```bash
npm run package:all
# Genera Windows + Linux (macOS debe hacerse por separado)
```

---

## 🐛 **Troubleshooting**

### **Problemas comunes:**

#### **❌ "Backend no respondió en el tiempo esperado"**
```bash
# Revisar logs
type "%APPDATA%\ReporteAutomatico\logs\backend.log"

# Probar backend manualmente
cd build\backend
.\backend.exe
```

#### **❌ "ModuleNotFoundError: No module named 'fastapi'"**
```bash
# Reinstalar dependencias Python
cd ..\..\backend
pip install -r requirements.txt

# Recompilar backend
cd ..\desktop
npm run build:backend
```

#### **❌ "Cannot create symbolic link" (Windows)**
- **Solución:** Ejecutar terminal como Administrador
- **O:** Habilitar "Modo Desarrollador" en Windows

#### **❌ Problemas de zoom al maximizar**
- **Solución:** Ya está implementado en `main.js`
- Si persiste, ejecutar `npm run dev` y abrir DevTools

---

## 📂 **Estructura de Archivos del Instalador**

### **Windows (.exe):**
```
Reporte Automático/
├── Reporte Automático.exe    # Aplicación principal
├── resources/
│   ├── app.asar              # Código Electron
│   ├── backend.exe           # Backend compilado
│   └── frontend/             # Frontend estático
│       ├── index.html
│       └── assets/
└── (uninstall.exe)
```

### **Linux (.AppImage):**
```
Reporte-Automático.AppImage  # Todo incluido (portátil)
```

### **Linux (.deb):**
```
/opt/reporte-automatico/
├── Reporte Automático        # Ejecutable principal
└── resources/                # Backend + Frontend
```

### **macOS (.dmg):**
```
Reporte Automático.app/
├── Contents/
│   ├── MacOS/Electron        # Ejecutable principal
│   └── Resources/
│       ├── app.asar
│       ├── backend           # Backend macOS
│       └── frontend/         # Frontend estático
```

---

## 🔧 **Configuración Avanzada**

### **Variables de entorno:**
- **Logs:** `%APPDATA%\ReporteAutomatico\logs\` (Windows)
- **Backend:** `http://127.0.0.1:8000` (fijo)
- **Frontend:** Protocolo `file://` (empaquetado)

### **Configuración de Electron:**
- **Versión:** 28.0.0 (estable)
- **Code signing:** Deshabilitado
- **Auto-update:** No configurado
- **DevTools:** Solo en desarrollo (`--dev`)

### **PyInstaller (Backend):**
- **Modo:** `--onefile`
- **Dependencias:** `--collect-all` para FastAPI, uvicorn, pandas
- **Hidden imports:** Módulos uvicorn y app

---

## 📝 **Notas de Desarrollo**

### **Cambios recientes:**
- ✅ **Zoom controlado** al maximizar ventana
- ✅ **DPI scaling** configurado para Windows
- ✅ **Tamaño mínimo** establecido (1000x600)
- ✅ **Multiplataforma** configurado
- ✅ **Logs mejorados** con timestamps

### **Limitaciones conocidas:**
- **macOS:** Requiere Mac para compilar
- **Linux:** Backend debe compilarse para Linux específico
- **Zoom:** Puede requerir ajustes según pantalla

### **Próximas mejoras:**
- 🔄 **Auto-update** configuración
- 🎨 **Iconos personalizados** por plataforma
- 📦 **Compresión** para reducir tamaño
- 🔐 **Code signing** (opcional)

---

## 🚀 **Instalación y Uso**

### **Windows:**
1. Ejecutar `Reporte Automático Setup 1.0.0.exe`
2. Seguir instalador NSIS
3. Acceso directo en Escritorio y Menú Inicio

### **Linux:**
```bash
# Opción 1: AppImage (portátil)
chmod +x Reporte-Automático-1.0.0.AppImage
./Reporte-Automático-1.0.0.AppImage

# Opción 2: Debian/Ubuntu
sudo dpkg -i reporte-automatico-desktop_1.0.0_amd64.deb
```

### **macOS:**
1. Abrir `Reporte Automático-1.0.0.dmg`
2. Arrastrar a Applications
3. Ejecutar desde Launchpad

---

## 📞 **Soporte**

- **Logs:** Siempre revisar los logs primero
- **Backend:** Puerto 8000 debe estar libre
- **Firewall:** Permitir conexión localhost
- **Antivirus:** Excluir carpeta de instalación si hay problemas

---

**Última actualización:** Febrero 2026  
**Versiones:** Electron 28.0.0, electron-builder 23.6.0, Python 3.12+
