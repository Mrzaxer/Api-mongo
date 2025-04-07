const express = require("express");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/user");

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// 📌 1️⃣ Generar token y enviar correo de recuperación
router.post("/forgotpassword", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // Generar token con expiración (1 hora)
        const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "1h" });

        // Guardar token en la base de datos
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();

        // Configuración de correo para Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetLink = `https://api-mongo-5hdo.onrender.com/resetpassword/${token}`;

        // Opciones del correo
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Restablecimiento de contraseña",
            text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`,
        };

        // Enviar correo
        await transporter.sendMail(mailOptions);

        res.json({ message: "Correo de restablecimiento enviado" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al enviar el correo", error });
    }
});

// 📌 2️⃣ Verificar token y actualizar contraseña (Texto Plano)
router.post("/resetpassword/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Verificar token
        const decoded = jwt.verify(token, SECRET);
        const user = await User.findOne({ _id: decoded.id, resetPasswordToken: token });

        if (!user || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Token inválido o expirado" });
        }

        // Guardar contraseña en texto plano (⚠️ NO SEGURO)
        user.password = newPassword;

        // Limpiar el token para evitar reutilización
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.json({ message: "Contraseña actualizada con éxito (texto plano)" });

    } catch (error) {
        res.status(400).json({ message: "Token inválido o expirado", error });
    }
});

// 📌 3️⃣ Validar token desde la URL
router.get("/validate-token/:token", async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, SECRET);
        const user = await User.findOne({ _id: decoded.id, resetPasswordToken: token });

        if (!user || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: "Token inválido o expirado" });
        }

        res.json({ message: "Token válido" });
    } catch (error) {
        res.status(400).json({ message: "Token inválido o expirado", error });
    }
});

module.exports = router;
