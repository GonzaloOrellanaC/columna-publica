import { Request, Response } from "express";
import { DatabaseService } from "../services/database.service";
import { hashPassword } from "../db/db";
import { sendWelcomeEmail } from "../utils/mailer";
import fs from "fs";
import path from "path";

export class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await DatabaseService.getUsers();
      return res.json({ success: true, users });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createUser(req: Request, res: Response) {
    const { email, password, name, role, bio, avatar } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "Correo, contraseña y nombre completo son requeridos." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const incomingHash = hashPassword(password);

    try {
      const newUser = await DatabaseService.createUser({
        email: cleanEmail,
        passwordHash: incomingHash,
        name,
        role: role || 'columnist',
        bio: bio || "",
        avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150`
      });

      sendWelcomeEmail({
        email: cleanEmail,
        name,
        role: role || 'columnist',
        passwordClearText: password
      }).catch(e => {
        console.error("[SMTP Notification] Error in asynchronous welcome email delivery:", e);
      });

      const sanitizedUser = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        bio: newUser.bio,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt
      };

      return res.status(201).json({ success: true, user: sanitizedUser });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error al crear el usuario." });
    }
  }

  static async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { name, bio, avatar, role, password, blocked } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    if (role !== undefined) updates.role = role;
    if (blocked !== undefined) updates.blocked = blocked;
    if (password) {
      updates.passwordHash = hashPassword(password);
    }

    try {
      // Fetch current database state for this user to check their previous avatar
      const current = await DatabaseService.getUserById(id);
      if (current && avatar && current.avatar !== avatar) {
        // If the old avatar is a local file (e.g. starting with '/uploads/'), delete it
        if (typeof current.avatar === "string" && current.avatar.startsWith("/uploads/")) {
          const oldPath = path.join(process.cwd(), "public", current.avatar);
          if (fs.existsSync(oldPath)) {
            try {
              fs.unlinkSync(oldPath);
            } catch (err: any) {
              console.warn(`[UserController] Failed to delete old avatar file at ${oldPath}:`, err);
            }
          }
        }
      }

      const updated = await DatabaseService.updateUser(id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado." });
      }

      return res.json({
        success: true,
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          bio: updated.bio,
          avatar: updated.avatar,
          blocked: updated.blocked
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    if (id === "user-super-primary") {
      return res.status(403).json({ success: false, message: "No es posible eliminar el Súper Administrador primario de la plataforma." });
    }

    try {
      const deleted = await DatabaseService.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado." });
      }
      return res.json({ success: true, message: "Usuario desvinculado con éxito." });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
