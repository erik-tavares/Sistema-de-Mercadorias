// import prisma from "../models/prisma.js";

// const normalizeProduct = (product) => ({
//   ...product,
//   imagem: product.imagem || "",
// });

// export const getAllProducts = async (req, res) => {
//   try {
//     const products = await prisma.product.findMany({
//       orderBy: { id: "asc" },
//     });

//     return res.status(200).json(products.map(normalizeProduct));
//   } catch (error) {
//     return res.status(500).json({ error: "Erro ao buscar produtos." });
//   }
// };

// export const createProduct = async (req, res) => {
//   const { nome, descricao, preco, imagem } = req.body;

//   if (!nome || !descricao || preco === undefined || preco === null) {
//     return res.status(400).json({ error: "Nome, descrição e preço são obrigatórios." });
//   }

//   try {
//     const novoProduto = await prisma.product.create({
//       data: {
//         nome: String(nome).trim(),
//         descricao: String(descricao).trim(),
//         preco: Number(preco),
//         imagem: imagem ? String(imagem) : "",
//       },
//     });

//     return res.status(201).json(normalizeProduct(novoProduto));
//   } catch (error) {
//     return res.status(400).json({ error: "Erro ao criar produto." });
//   }
// };

// export const updateProduct = async (req, res) => {
//   const { id } = req.params;
//   const { nome, descricao, preco, imagem } = req.body;

//   if (!nome || !descricao || preco === undefined || preco === null) {
//     return res.status(400).json({ error: "Nome, descrição e preço são obrigatórios." });
//   }

//   try {
//     const produtoAtualizado = await prisma.product.update({
//       where: { id: Number(id) },
//       data: {
//         nome: String(nome).trim(),
//         descricao: String(descricao).trim(),
//         preco: Number(preco),
//         imagem: imagem ? String(imagem) : "",
//       },
//     });

//     return res.status(200).json(normalizeProduct(produtoAtualizado));
//   } catch (error) {
//     return res.status(400).json({ error: "Erro ao atualizar produto." });
//   }
// };

// export const deleteProduct = async (req, res) => {
//   const { id } = req.params;

//   try {
//     await prisma.product.delete({
//       where: { id: Number(id) },
//     });

//     return res.status(200).json({ message: "Produto removido com sucesso." });
//   } catch (error) {
//     return res.status(400).json({ error: "Erro ao remover produto." });
//   }
// };

import prisma from "../models/prisma.js";

const normalizeProduct = (product) => ({
  ...product,
  imagem: product.imagem || "",
});

export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(products.map(normalizeProduct));
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);

    return res.status(500).json({
      error: "Erro ao buscar produtos.",
    });
  }
};

export const createProduct = async (req, res) => {
  const { nome, descricao, preco, imagem } = req.body;

  if (!nome || !descricao || preco === undefined || preco === null) {
    return res.status(400).json({
      error: "Nome, descrição e preço são obrigatórios.",
    });
  }

  const precoNumerico = Number(preco);

  if (!Number.isFinite(precoNumerico)) {
    return res.status(400).json({
      error: "Preço inválido.",
    });
  }

  try {
    const novoProduto = await prisma.product.create({
      data: {
        nome: String(nome).trim(),
        descricao: String(descricao).trim(),
        preco: precoNumerico,
        imagem: imagem ? String(imagem) : "",
      },
    });

    return res.status(201).json(normalizeProduct(novoProduto));
  } catch (error) {
    console.error("Erro ao criar produto:", error);

    return res.status(500).json({
      error: "Erro ao criar produto.",
    });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;

  const { nome, descricao, preco, imagem } = req.body;

  if (!nome || !descricao || preco === undefined || preco === null) {
    return res.status(400).json({
      error: "Nome, descrição e preço são obrigatórios.",
    });
  }

  const precoNumerico = Number(preco);

  if (!Number.isFinite(precoNumerico)) {
    return res.status(400).json({
      error: "Preço inválido.",
    });
  }

  try {
    const produtoAtualizado = await prisma.product.update({
      where: {
        id,
      },
      data: {
        nome: String(nome).trim(),
        descricao: String(descricao).trim(),
        preco: precoNumerico,
        imagem: imagem ? String(imagem) : "",
      },
    });

    return res.status(200).json(normalizeProduct(produtoAtualizado));
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);

    return res.status(404).json({
      error: "Produto não encontrado.",
    });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: "ID do produto obrigatório.",
    });
  }

  try {
    await prisma.product.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Produto removido com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao remover produto:", error);

    return res.status(404).json({
      error: "Produto não encontrado.",
    });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: "ID do produto obrigatório.",
    });
  }

  try {
    const produto = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!produto) {
      return res.status(404).json({
        error: "Produto não encontrado.",
      });
    }

    return res.status(200).json({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      imagem: produto.imagem || "",
      createdAt: produto.createdAt,
      updatedAt: produto.updatedAt,
    });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);

    return res.status(500).json({
      error: "Erro ao buscar produto.",
    });
  }
};
