import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

async function createZip() {
  const zip = new AdmZip();
  const rootDir = process.cwd();

  console.log("=== Iniciando creación de paquete ZIP para Producción ===");

  // 1. Add dist directory
  const distDir = path.resolve(rootDir, "dist");
  if (fs.existsSync(distDir)) {
    console.log("Añadiendo carpeta 'dist' al paquete...");
    zip.addLocalFolder(distDir, "dist");
  } else {
    console.error("Error: La carpeta 'dist' no existe. Por favor ejecuta 'npm run build' primero.");
    process.exit(1);
  }

  // 2. Add public directory (excluding public/uploads if it has files)
  const publicDir = path.resolve(rootDir, "public");
  if (fs.existsSync(publicDir)) {
    console.log("Añadiendo carpeta 'public' al paquete...");
    // We add files and folders recursively but exclude "uploads"
    const items = fs.readdirSync(publicDir);
    for (const item of items) {
      if (item === "uploads") continue;
      const itemPath = path.join(publicDir, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
         zip.addLocalFolder(itemPath, `public/${item}`);
      } else {
         zip.addLocalFile(itemPath, "public");
      }
    }
  }

  // 3. Add package.json
  const packageJsonPath = path.resolve(rootDir, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    console.log("Añadiendo 'package.json'...");
    // Read and trim devDependencies to make it even more lightweight for the hosting server
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    
    // We can clean devDependencies since it's a production zip
    delete packageJson.devDependencies;
    
    // Ensure scripts only has production keys
    packageJson.scripts = {
      "start": "node dist/server.cjs"
    };

    zip.addFile("package.json", Buffer.from(JSON.stringify(packageJson, null, 2)), "package.json");
  }

  // 4. Add package-lock.json if exists
  const lockPath = path.resolve(rootDir, "package-lock.json");
  if (fs.existsSync(lockPath)) {
    console.log("Añadiendo 'package-lock.json'...");
    zip.addLocalFile(lockPath);
  }

  // 5. Add .env.example
  const envExamplePath = path.resolve(rootDir, ".env.example");
  if (fs.existsSync(envExamplePath)) {
    console.log("Añadiendo '.env.example'...");
    zip.addLocalFile(envExamplePath);
  }

  // Determine output file
  const outputZipName = "columna-publica-prod.zip";
  const outputPath = path.resolve(rootDir, outputZipName);

  console.log(`Escribiendo archivo ZIP en: ${outputPath}...`);
  zip.writeZip(outputPath);

  console.log(`\n¡Éxito! Archivo de producción creado en: ${outputZipName}`);
  console.log("Este archivo está listo para ser subido y descomprimido en tu hosting Node.js.");
  console.log("Instrucciones de ejecución en tu hosting:");
  console.log("1. Descomprimir el contenido del archivo zip.");
  console.log("2. Configurar las variables de entorno (.env).");
  console.log("3. Ejecutar 'npm install --omit=dev' para instalar dependencias.");
  console.log("4. Iniciar la app usando 'npm start'.\n");
}

createZip().catch((err) => {
  console.error("Error al generar el archivo ZIP:", err);
  process.exit(1);
});
