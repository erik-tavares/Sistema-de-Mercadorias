import prisma from "../models/prisma.js";

const normalizeProduct = (product) => ({
  ...product,
  imagem: product.imagem || "",
});

export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });

    return res.status(200).json(products.map(normalizeProduct));
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar produtos." });
  }
};

export const createProduct = async (req, res) => {
  const { nome, descricao, preco, imagem } = req.body;

  if (!nome || !descricao || preco === undefined || preco === null) {
    return res.status(400).json({ error: "Nome, descrição e preço são obrigatórios." });
  }

  try {
    const novoProduto = await prisma.product.create({
      data: {
        nome: String(nome).trim(),
        descricao: String(descricao).trim(),
        preco: Number(preco),
        imagem: imagem ? String(imagem) : "",
      },
    });

    return res.status(201).json(normalizeProduct(novoProduto));
  } catch (error) {
    return res.status(400).json({ error: "Erro ao criar produto." });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, imagem } = req.body;

  if (!nome || !descricao || preco === undefined || preco === null) {
    return res.status(400).json({ error: "Nome, descrição e preço são obrigatórios." });
  }

  try {
    const produtoAtualizado = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        nome: String(nome).trim(),
        descricao: String(descricao).trim(),
        preco: Number(preco),
        imagem: imagem ? String(imagem) : "",
      },
    });

    return res.status(200).json(normalizeProduct(produtoAtualizado));
  } catch (error) {
    return res.status(400).json({ error: "Erro ao atualizar produto." });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Produto removido com sucesso." });
  } catch (error) {
    return res.status(400).json({ error: "Erro ao remover produto." });
  }
};
