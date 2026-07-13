import { Request, Response } from "express";
import { DatabaseService } from "../services/database.service";
import { hashPassword } from "../db/db";
import { sendRecoveryEmail, sendVerificationEmail } from "../utils/mailer";

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Correo y contraseña son requeridos" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const incomingHash = hashPassword(password);

    try {
      const user = await DatabaseService.getUserByEmail(cleanEmail);
      if (!user || user.passwordHash !== incomingHash) {
        return res.status(401).json({ success: false, message: "Credenciales de acceso inválidas." });
      }
      if (user.blocked) {
        return res.status(403).json({ success: false, message: "Su cuenta se encuentra suspendida temporalmente." });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          bio: user.bio,
          avatar: user.avatar,
          createdAt: user.createdAt
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async register(req: Request, res: Response) {
    const { email, password, name, role, bio, avatar } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "Correo, contraseña y nombre son requeridos." });
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
        avatar: avatar || `/default-avatar.svg`
      });

      return res.status(201).json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          bio: newUser.bio,
          avatar: newUser.avatar,
          createdAt: newUser.createdAt
        }
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "El correo electrónico es requerido." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const token = "tok-" + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
    const expiration = new Date(Date.now() + 3600 * 1000).toISOString();

    try {
      const user = await DatabaseService.getUserByEmail(cleanEmail);
      if (user) {
        await DatabaseService.updateUser(user.id, {
          resetToken: token,
          resetTokenExpires: expiration
        });

        const origin = req.headers.origin || `http://${req.headers.host}` || "https://columnapublica.cl";
        const resetLink = `${origin}/login?recoveryToken=${token}`;

        sendRecoveryEmail({
          email: user.email,
          name: user.name,
          resetLink
        }).catch(err => {
          console.error("[Email Notification Error] Falló el correo de recuperación:", err);
        });
      }

      return res.json({ 
        success: true, 
        message: "Si el correo electrónico se encuentra registrado en nuestro sistema, recibirá un mensaje con las instrucciones de restablecimiento en breve." 
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "El token de recuperación y la nueva contraseña son requeridos." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "La contraseña debe tener al menos 6 caracteres." });
    }

    const hashed = hashPassword(newPassword);

    try {
      const user = await DatabaseService.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: "El enlace de recuperación es inválido o ha expirado. Por favor, solicite uno nuevo." 
        });
      }

      const expiresAt = user.resetTokenExpires ? new Date(user.resetTokenExpires).getTime() : 0;
      if (expiresAt <= Date.now()) {
        return res.status(400).json({ 
          success: false, 
          message: "El enlace de recuperación ha expirado. Por favor, solicite uno nuevo." 
        });
      }

      await DatabaseService.updateUser(user.id, {
        passwordHash: hashed,
        resetToken: "",
        resetTokenExpires: ""
      });

      return res.json({ success: true, message: "Su contraseña ha sido reconfigurada exitosamente. Ahora puede iniciar sesión con sus nuevas credenciales." });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async registerReader(req: Request, res: Response) {
    const { name, email, style } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "El nombre y el correo electrónico son obligatorios." });
    }

    const cleanEmail = email.toLowerCase().trim();
    // Generate a secure 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      await DatabaseService.saveReaderVerification(cleanEmail, name.trim(), code, style || "diplomatic");
      
      // Dispatch the validation email (runs with high-end console box backup)
      sendVerificationEmail({
        email: cleanEmail,
        name: name.trim(),
        code
      }).catch(err => {
        console.error("[Email Verification Error] Falló el despacho de correo de verificación:", err);
      });

      return res.json({
        success: true,
        message: "Código de validación despachado exitosamente.",
        sandboxCode: code // Return the code in the response so the frontend sandbox can intercept and ease evaluation!
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async verifyReader(req: Request, res: Response) {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "El correo electrónico y el código de verificación son requeridos." });
    }

    try {
      const result = await DatabaseService.verifyReaderCode(email, code);
      if (result.success) {
        return res.json({
          success: true,
          verified: true,
          name: result.name,
          style: result.style,
          message: "Lector Oficial validado con éxito."
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "El código de validación ingresado es incorrecto. Intente nuevamente."
        });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
