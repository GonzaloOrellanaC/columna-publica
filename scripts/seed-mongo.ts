import 'dotenv/config';
import { connectMongoDB, runMongoSeed } from "../src/db/mongodb";
import mongoose from "mongoose";

async function main() {
  console.log("=== Iniciando inyección de datos de database.json a MongoDB ===");
  const connected = await connectMongoDB();
  if (!connected) {
    console.error("Error: No se pudo conectar a MongoDB. Asegúrate de configurar MONGODB_URI en tu archivo .env");
    process.exit(1);
  }

  console.log("Conexión a MongoDB establecida exitosamente. Cargando datos...");
  await runMongoSeed();
  
  console.log("Inyección de datos completada. Cerrando conexión...");
  await mongoose.connection.close();
  console.log("Conexión de MongoDB cerrada.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error durante el sembrado:", err);
  process.exit(1);
});
