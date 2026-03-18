PM2 + nodemon (backend)
=========================

Este repositorio incluye una configuración para iniciar el backend con PM2 usando `nodemon` y `tsx`, cargando las variables de entorno desde el archivo `.env` en la raíz del proyecto.

Archivos importantes
- **ecosystem:** [ecosystem.config.cjs](ecosystem.config.cjs#L1-L20)
- **scripts:** [package.json](package.json#L1)

Requisitos
- PM2 instalado globalmente: `npm i -g pm2`
- Dependencias locales para desarrollo: `nodemon` y `tsx` (ya están en `devDependencies`).

Cómo usar

Iniciar con PM2 (producción):
```bash
npm run pm2:start
```

Iniciar en modo desarrollo (usa NODE_ENV=development):
```bash
npm run pm2:dev
```

Detener la app gestionada por PM2:
```bash
npm run pm2:stop
```

Reiniciar:
```bash
npm run pm2:restart
```

Eliminar del proceso PM2:
```bash
npm run pm2:delete
```

Ver estado y logs
- Estado: `pm2 status`
- Logs (stream): `pm2 logs columna-backend`
- Ver últimas líneas de log: `pm2 logs columna-backend --lines 200`

Notas sobre las variables de entorno
- El archivo `.env` en la raíz se carga automáticamente en `ecosystem.config.cjs` mediante `dotenv`. Las variables estarán disponibles para la aplicación cuando PM2 la ejecute.

Arranque al iniciar el sistema (opcional)
```bash
pm2 startup
pm2 save
```

Si quieres, puedo ejecutar una prueba de arranque aquí o añadir más instrucciones (por ejemplo, configuración de systemd). 
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/1f9af76d-1982-440b-97bb-d2102a5fbb88

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
