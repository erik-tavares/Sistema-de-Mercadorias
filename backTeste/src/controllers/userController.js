// import bcrypt from "bcryptjs";
// import prisma from "../models/prisma.js";

// const usuariosAtivos = new Map();
// const TEMPO_EXPIRACAO_SESSAO = 45 * 1000;

// function limparUsuariosInativos() {
//   const agora = Date.now();

//   for (const [id, ultimoContato] of usuariosAtivos) {
//     if (agora - ultimoContato > TEMPO_EXPIRACAO_SESSAO) {
//       usuariosAtivos.delete(id);
//     }
//   }
// }

// function registrarUsuarioAtivo(id) {
//   limparUsuariosInativos();
//   usuariosAtivos.set(Number(id), Date.now());
// }

// const sanitizeUser = (user) => ({
//   id: user.id,
//   nome: user.name,
//   email: user.email,
//   fotoPerfil: user.fotoPerfil || "",
//   tipo: user.tipo || "cliente",
//   rememberedEmail: user.rememberedEmail || "",
//   rememberedPassword: user.rememberedPassword || "",
//   rememberedAt: user.rememberedAt || null,
//   lastLoginAt: user.lastLoginAt || null,
//   theme: user.theme || "light",
// });

// export const createUser = async (req, res) => {
//   const { nome, email, senha, tipo } = req.body;

//   if (!nome || !email || !senha) {
//     return res
//       .status(400)
//       .json({ error: "Nome, e-mail e senha são obrigatórios." });
//   }

//   try {
//     const emailExiste = await prisma.user.findUnique({
//       where: { email: String(email).trim().toLowerCase() },
//     });

//     if (emailExiste) {
//       return res.status(409).json({ error: "E-mail já cadastrado." });
//     }

//     const senhaHash = await bcrypt.hash(String(senha), 10);

//     const newUser = await prisma.user.create({
//       data: {
//         name: String(nome).trim(),
//         email: String(email).trim().toLowerCase(),
//         password: senhaHash,
//         tipo: tipo || "cliente",
//       },
//     });

//     return res.status(201).json(sanitizeUser(newUser));
//   } catch (error) {
//     return res.status(400).json({ error: "Erro ao criar usuário." });
//   }
// };

// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await prisma.user.findMany({
//       orderBy: { id: "asc" },
//     });

//     return res.status(200).json(users.map(sanitizeUser));
//   } catch (error) {
//     return res.status(500).json({ error: "Erro ao buscar usuários." });
//   }
// };

// export const loginUser = async (req, res) => {
//   const { email, senha, lembrarUsuario } = req.body;

//   if (!email || !senha) {
//     return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
//   }

//   try {
//     const usuario = await prisma.user.findUnique({
//       where: { email: String(email).trim().toLowerCase() },
//     });

//     if (!usuario) {
//       return res.status(401).json({ error: "E-mail ou senha incorretos." });
//     }

//     const senhaValida = await bcrypt.compare(String(senha), usuario.password);

//     if (!senhaValida) {
//       return res.status(401).json({ error: "E-mail ou senha incorretos." });
//     }

//     limparUsuariosInativos();

//     if (usuariosAtivos.has(usuario.id)) {
//       return res.status(409).json({
//         error: "Este usuário já está logado em outra sessão.",
//       });
//     }

//     const usuarioAtualizado = await prisma.$transaction(async (transacao) => {
//       await transacao.user.updateMany({
//         data: {
//           rememberedEmail: null,
//           rememberedPassword: null,
//           rememberedAt: null,
//         },
//       });

//       return transacao.user.update({
//         where: { id: usuario.id },
//         data: {
//           lastLoginAt: new Date(),
//           ...(lembrarUsuario
//             ? {
//                 rememberedEmail: String(email).trim().toLowerCase(),
//                 rememberedPassword: String(senha),
//                 rememberedAt: new Date(),
//               }
//             : {
//                 rememberedEmail: null,
//                 rememberedPassword: null,
//                 rememberedAt: null,
//               }),
//         },
//       });
//     });

//     registrarUsuarioAtivo(usuarioAtualizado.id);

//     return res.status(200).json(sanitizeUser(usuarioAtualizado));
//   } catch (error) {
//     return res.status(500).json({ error: "Erro ao fazer login." });
//   }
// };

// export const heartbeatUser = (req, res) => {
//   const { id } = req.body;

//   if (!id) {
//     return res.status(400).json({ error: "ID do usuário obrigatório." });
//   }

//   registrarUsuarioAtivo(id);

//   return res.status(200).json({ ok: true });
// };

// export const logoutUser = (req, res) => {
//   const { id } = req.body;

//   if (id) {
//     usuariosAtivos.delete(Number(id));
//   }

//   return res.status(200).json({ ok: true });
// };

// export const getActiveUsers = (req, res) => {
//   limparUsuariosInativos();

//   return res.status(200).json({
//     count: usuariosAtivos.size,
//     ids: Array.from(usuariosAtivos.keys()),
//   });
// };

// export const updateUserTheme = async (req, res) => {
//   const { id } = req.params;
//   const { theme } = req.body;

//   if (!id) {
//     return res.status(400).json({ error: "ID do usuário obrigatório." });
//   }

//   if (theme !== "dark" && theme !== "light") {
//     return res.status(400).json({ error: "Tema inválido." });
//   }

//   try {
//     const usuario = await prisma.user.update({
//       where: { id: Number(id) },
//       data: {
//         theme,
//       },
//     });

//     return res.status(200).json(sanitizeUser(usuario));
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ error: "Erro ao atualizar tema do usuário." });
//   }
// };

// export const updateUserProfile = async (req, res) => {
//   const { id } = req.params;
//   const { nome, fotoPerfil } = req.body;

//   if (!id || !String(nome || "").trim()) {
//     return res.status(400).json({ error: "Nome do usuário é obrigatório." });
//   }

//   try {
//     // const usuario = await prisma.user.update({
//     //   where: { id: Number(id) },
//     const usuario = await prisma.user.update({
//       where: { id },
//       data: {
//         name: String(nome).trim(),
//         fotoPerfil: fotoPerfil || null,
//       },
//     });

//     return res.status(200).json(sanitizeUser(usuario));
//   } catch (error) {
//     return res.status(500).json({ error: "Erro ao atualizar perfil." });
//   }
// };

import bcrypt from "bcryptjs";
import prisma from "../models/prisma.js";

const usuariosAtivos = new Map();

const TEMPO_EXPIRACAO_SESSAO = 45 * 1000;

async function executarComRetry(operacao, tentativas = 3) {
  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      return await operacao();
    } catch (error) {
      if (error?.code !== "P2034" || tentativa === tentativas) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, tentativa * 200));
    }
  }
}

function limparUsuariosInativos() {
  const agora = Date.now();

  for (const [id, ultimoContato] of usuariosAtivos) {
    if (agora - ultimoContato > TEMPO_EXPIRACAO_SESSAO) {
      usuariosAtivos.delete(id);
    }
  }
}

function registrarUsuarioAtivo(id) {
  limparUsuariosInativos();

  usuariosAtivos.set(String(id), Date.now());
}

const sanitizeUser = (user) => ({
  id: user.id,
  nome: user.name,
  email: user.email,
  fotoPerfil: user.fotoPerfil || "",
  tipo: user.tipo || "cliente",
  rememberedEmail: user.rememberedEmail || "",
  rememberedPassword: user.rememberedPassword || "",
  rememberedAt: user.rememberedAt || null,
  lastLoginAt: user.lastLoginAt || null,
  theme: user.theme || "light",
});

export const createUser = async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      error: "Nome, e-mail e senha são obrigatórios.",
    });
  }

  try {
    const emailNormalizado = String(email).trim().toLowerCase();

    const emailExiste = await prisma.user.findUnique({
      where: {
        email: emailNormalizado,
      },
    });

    if (emailExiste) {
      return res.status(409).json({
        error: "E-mail já cadastrado.",
      });
    }

    const senhaHash = await bcrypt.hash(String(senha), 10);

    const newUser = await prisma.user.create({
      data: {
        name: String(nome).trim(),
        email: emailNormalizado,
        password: senhaHash,
        tipo: tipo || "cliente",
      },
    });

    return res.status(201).json(sanitizeUser(newUser));
  } catch (error) {
    console.error("Erro ao criar usuário:", error);

    return res.status(500).json({
      error: "Erro ao criar usuário.",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(users.map(sanitizeUser));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);

    return res.status(500).json({
      error: "Erro ao buscar usuários.",
    });
  }
};

export const loginUser = async (req, res) => {
  const { email, senha, lembrarUsuario } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      error: "E-mail e senha são obrigatórios.",
    });
  }

  try {
    const emailNormalizado = String(email).trim().toLowerCase();

    const usuario = await prisma.user.findUnique({
      where: {
        email: emailNormalizado,
      },
    });

    if (!usuario) {
      return res.status(401).json({
        error: "E-mail ou senha incorretos.",
      });
    }

    const senhaValida = await bcrypt.compare(String(senha), usuario.password);

    if (!senhaValida) {
      return res.status(401).json({
        error: "E-mail ou senha incorretos.",
      });
    }

    usuariosAtivos.delete(String(usuario.id));

    const usuarioAtualizado = await executarComRetry(() =>
      prisma.user.update({
        where: {
          id: usuario.id,
        },
        data: {
          lastLoginAt: new Date(),

          ...(lembrarUsuario
            ? {
                rememberedEmail: emailNormalizado,
                rememberedPassword: String(senha),
                rememberedAt: new Date(),
              }
            : {
                rememberedEmail: null,
                rememberedPassword: null,
                rememberedAt: null,
              }),
        },
      }),
    );

    registrarUsuarioAtivo(usuarioAtualizado.id);

    return res.status(200).json(sanitizeUser(usuarioAtualizado));
  } catch (error) {
    console.error("Erro ao fazer login:", error);

    return res.status(500).json({
      error: "Erro ao fazer login.",
    });
  }
};

export const heartbeatUser = (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({
      error: "ID do usuário obrigatório.",
    });
  }

  registrarUsuarioAtivo(id);

  return res.status(200).json({
    ok: true,
  });
};

export const logoutUser = (req, res) => {
  const { id } = req.body;

  if (id) {
    usuariosAtivos.delete(String(id));
  }

  return res.status(200).json({
    ok: true,
  });
};

export const getActiveUsers = (req, res) => {
  limparUsuariosInativos();

  return res.status(200).json({
    count: usuariosAtivos.size,
    ids: Array.from(usuariosAtivos.keys()),
  });
};

export const updateUserTheme = async (req, res) => {
  const { id } = req.params;
  const { theme } = req.body;

  if (!id) {
    return res.status(400).json({
      error: "ID do usuário obrigatório.",
    });
  }

  if (theme !== "dark" && theme !== "light") {
    return res.status(400).json({
      error: "Tema inválido.",
    });
  }

  try {
    const usuario = await prisma.user.update({
      where: {
        id,
      },
      data: {
        theme,
      },
    });

    return res.status(200).json(sanitizeUser(usuario));
  } catch (error) {
    console.error("Erro ao atualizar tema:", error);

    return res.status(500).json({
      error: "Erro ao atualizar tema do usuário.",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { nome, fotoPerfil } = req.body;

  if (!id || !String(nome || "").trim()) {
    return res.status(400).json({
      error: "Nome do usuário é obrigatório.",
    });
  }

  try {
    const usuario = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: String(nome).trim(),
        fotoPerfil: fotoPerfil || null,
      },
    });

    return res.status(200).json(sanitizeUser(usuario));
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);

    return res.status(500).json({
      error: "Erro ao atualizar perfil.",
    });
  }
};
