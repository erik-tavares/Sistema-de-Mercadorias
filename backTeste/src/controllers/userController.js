import bcrypt from "bcryptjs";
import prisma from "../models/prisma.js";

const sanitizeUser = (user) => ({
  id: user.id,
  nome: user.name,
  email: user.email,
  tipo: user.tipo || "cliente",
  rememberedEmail: user.rememberedEmail || "",
  rememberedPassword: user.rememberedPassword || "",
  theme: user.theme || "light",
});

export const createUser = async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
  }

  try {
    const emailExiste = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });

    if (emailExiste) {
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    const senhaHash = await bcrypt.hash(String(senha), 10);

    const newUser = await prisma.user.create({
      data: {
        name: String(nome).trim(),
        email: String(email).trim().toLowerCase(),
        password: senhaHash,
        tipo: tipo || "cliente",
      },
    });

    return res.status(201).json(sanitizeUser(newUser));
  } catch (error) {
    return res.status(400).json({ error: "Erro ao criar usuário." });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" },
    });

    return res.status(200).json(users.map(sanitizeUser));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar usuários." });
  }
};

export const loginUser = async (req, res) => {
  const { email, senha, lembrarUsuario } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
  }

  try {
    const usuario = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });

    if (!usuario) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    const senhaValida = await bcrypt.compare(String(senha), usuario.password);

    if (!senhaValida) {
      return res.status(401).json({ error: "E-mail ou senha incorretos." });
    }

    const dadosPersistidos = lembrarUsuario
      ? {
          rememberedEmail: String(email).trim().toLowerCase(),
          rememberedPassword: String(senha),
        }
      : {
          rememberedEmail: null,
          rememberedPassword: null,
        };

    const usuarioAtualizado = await prisma.user.update({
      where: { id: usuario.id },
      data: dadosPersistidos,
    });

    return res.status(200).json(sanitizeUser(usuarioAtualizado));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao fazer login." });
  }
};

export const updateUserTheme = async (req, res) => {
  const { id } = req.params;
  const { theme } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID do usuário obrigatório." });
  }

  if (theme !== "dark" && theme !== "light") {
    return res.status(400).json({ error: "Tema inválido." });
  }

  try {
    const usuario = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        theme,
      },
    });

    return res.status(200).json(sanitizeUser(usuario));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar tema do usuário." });
  }
};
