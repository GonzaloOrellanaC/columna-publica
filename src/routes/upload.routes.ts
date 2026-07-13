import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadRouter = Router();

// Configure storage with dynamic subfolders inside the public directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = "images/general";
    
    // Determine the category folder based on route path, field name or query hints if any
    if (file.fieldname === "avatar" || req.path.includes("avatar")) {
      subfolder = "images/profiles";
    } else if (file.fieldname === "image" || req.path.includes("image")) {
      subfolder = "images/posts";
    } else if (file.fieldname === "document" || req.path.includes("document")) {
      subfolder = "files/posts";
    }

    const uploadDir = path.resolve("./public/uploads", subfolder);
    
    // Ensure nesting directories exist recursively
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

uploadRouter.post("/image", upload.single("image"), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No se subió ningún archivo" });
  // Map files saved in ./public/uploads/xxx to a public path like /uploads/xxx
  const relativePath = path.relative(path.resolve("./public/uploads"), req.file.path).replace(/\\/g, "/");
  res.json({ success: true, url: `/uploads/${relativePath}` });
});

uploadRouter.post("/document", upload.single("document"), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No se subió ningún archivo" });
  const relativePath = path.relative(path.resolve("./public/uploads"), req.file.path).replace(/\\/g, "/");
  res.json({ success: true, url: `/uploads/${relativePath}` });
});

uploadRouter.post("/avatar", upload.single("avatar"), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No se subió ningún archivo" });
  const relativePath = path.relative(path.resolve("./public/uploads"), req.file.path).replace(/\\/g, "/");
  res.json({ success: true, url: `/uploads/${relativePath}` });
});

export default uploadRouter;
