import { useEffect, useState } from "react";

import "../Styles/Admin.css";

type Props = {
  sair: () => void;
  usuarioLogado: Usuario | null;
  onLogout: () => void;
};

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  imagens?: string[];
};

type Usuario = {
  id: number;
  nome: string;
  email: string;
  fotoPerfil?: string;
  lastLoginAt?: string | null;
  senha?: string;
  tipo?: "admin" | "usuario";
};

function Admin(_props: Props) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [imagens, setImagens] = useState<string[]>([]);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [produtoAnimando, setProdutoAnimando] = useState<number | null>(null);
  const [fechandoFormulario, setFechandoFormulario] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [imagemAmpliada, setImagemAmpliada] = useState<string | null>(null);
  const [fechandoImagemAmpliada, setFechandoImagemAmpliada] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [produtoAdicionado, setProdutoAdicionado] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosAtivos, setUsuariosAtivos] = useState<number[]>([]);
  const [fotoUsuarioSelecionada, setFotoUsuarioSelecionada] =
    useState<Usuario | null>(null);
  const [produtoImagemSelecionada, setProdutoImagemSelecionada] =
    useState<Produto | null>(null);
  const [descricaoExpandida, setDescricaoExpandida] = useState(false);
  async function carregarUsuariosAtivos() {
    try {
      const resposta = await fetch("http://localhost:3000/api/users/active");

      if (!resposta.ok) {
        return;
      }

      const dados = await resposta.json();

      setUsuariosAtivos(dados.ids || []);
    } catch (error) {
      console.error("Erro ao carregar usuários ativos:", error);
    }
  }

  // PAGINAÇÃO DOS PRODUTOS
  const PRODUTOS_POR_PAGINA = 6;

  const [paginaProdutos, setPaginaProdutos] = useState(1);

  const totalPaginasProdutos = Math.max(
    1,
    Math.ceil(produtos.length / PRODUTOS_POR_PAGINA),
  );

  const indiceInicialProdutos = (paginaProdutos - 1) * PRODUTOS_POR_PAGINA;

  const produtosDaPagina = produtos.slice(
    indiceInicialProdutos,
    indiceInicialProdutos + PRODUTOS_POR_PAGINA,
  );

  function abrirImagemAmpliada(imagem: string) {
    setFechandoImagemAmpliada(false);
    setImagemAmpliada(imagem);
  }

  function fecharImagemAmpliada() {
    setFechandoImagemAmpliada(true);

    window.setTimeout(() => {
      setImagemAmpliada(null);
      setFechandoImagemAmpliada(false);
    }, 250);
  }

  function selecionarImagens(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(event.target.files || []);

    if (arquivos.length === 0) return;

    const imagensConvertidas = arquivos.map(
      (arquivo) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            resolve(String(reader.result));
          };

          reader.onerror = reject;

          reader.readAsDataURL(arquivo);
        }),
    );

    Promise.all(imagensConvertidas)
      .then((novasImagens) => {
        setImagens((anteriores) => [...anteriores, ...novasImagens]);
      })
      .catch((error) => {
        console.error("Erro ao carregar imagens:", error);
      });

    event.target.value = "";
  }

  function removerImagem(index: number) {
    setImagens((anteriores) =>
      anteriores.filter((_, indice) => indice !== index),
    );
  }

  function formatarUltimoLogin(lastLoginAt?: string | null) {
    if (!lastLoginAt) {
      return "Nunca acessou";
    }

    const diferencaEmSegundos = Math.max(
      0,
      Math.floor((Date.now() - new Date(lastLoginAt).getTime()) / 1000),
    );

    if (diferencaEmSegundos < 60) {
      return "Agora há pouco";
    }

    const minutos = Math.floor(diferencaEmSegundos / 60);

    if (minutos < 60) {
      return `Há ${minutos} minuto${minutos === 1 ? "" : "s"}`;
    }

    const horas = Math.floor(minutos / 60);

    if (horas < 24) {
      return `Há ${horas} hora${horas === 1 ? "" : "s"}`;
    }

    const dias = Math.floor(horas / 24);

    return `Há ${dias} dia${dias === 1 ? "" : "s"}`;
  }

  useEffect(() => {
    async function carregarDados() {
      setCarregandoDados(true);

      try {
        const [produtosResponse, usuariosResponse] = await Promise.all([
          fetch("http://localhost:3000/api/products"),
          fetch("http://localhost:3000/api/users"),
        ]);

        const produtosSalvos = produtosResponse.ok
          ? await produtosResponse.json()
          : [];

        const usuariosSalvos = usuariosResponse.ok
          ? await usuariosResponse.json()
          : [];

        const produtosFormatados = produtosSalvos.map((produto: any) => ({
          ...produto,
          imagem: produto.imagem || "",
        }));

        const usuariosFormatados = usuariosSalvos.map((usuario: any) => ({
          id: usuario.id,
          nome: usuario.nome || usuario.name,
          email: usuario.email,
          fotoPerfil: usuario.fotoPerfil || "",
          lastLoginAt: usuario.lastLoginAt || null,
          tipo: usuario.tipo || "usuario",
        }));

        setProdutos(produtosFormatados);
        setUsuarios(usuariosFormatados);
      } catch (error) {
        console.error("Erro ao carregar dados do backend:", error);
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDados();
  }, []);

  useEffect(() => {
    carregarUsuariosAtivos();

    const primeiraAtualizacao = window.setTimeout(carregarUsuariosAtivos, 1000);

    const intervalo = window.setInterval(carregarUsuariosAtivos, 3000);

    return () => {
      window.clearTimeout(primeiraAtualizacao);
      window.clearInterval(intervalo);
    };
  }, []);

  // Garante que a página atual nunca fique vazia depois de excluir produtos
  useEffect(() => {
    setPaginaProdutos((paginaAtual) =>
      Math.min(
        paginaAtual,
        Math.max(1, Math.ceil(produtos.length / PRODUTOS_POR_PAGINA)),
      ),
    );
  }, [produtos.length]);

  useEffect(() => {
    async function atualizarUsuarios() {
      try {
        const resposta = await fetch("http://localhost:3000/api/users");

        if (!resposta.ok) {
          return;
        }

        const usuariosAtualizados = await resposta.json();

        setUsuarios(
          usuariosAtualizados.map((usuario: any) => ({
            id: usuario.id,
            nome: usuario.nome || usuario.name,
            email: usuario.email,
            fotoPerfil: usuario.fotoPerfil || "",
            lastLoginAt: usuario.lastLoginAt || null,
            tipo: usuario.tipo || "usuario",
          })),
        );
      } catch (error) {
        console.error("Erro ao atualizar usuários no admin:", error);
      }
    }

    const intervalo = window.setInterval(atualizarUsuarios, 5000);

    return () => window.clearInterval(intervalo);
  }, []);

  function abrirFormulario() {
    setEditandoId(null);
    setNome("");
    setDescricao("");
    setPreco("");
    setImagens([]);
    setDescricaoExpandida(false);
    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    setDescricaoExpandida(false);
    setFechandoFormulario(true);
    setTimeout(() => {
      setMostrarFormulario(false);
      setFechandoFormulario(false);
      setNome("");
      setDescricao("");
      setImagens([]);
      setPreco("");
      setEditandoId(null);
    }, 400);
  }

  async function adicionarProduto() {
    if (!nome.trim() || !descricao.trim() || !preco.trim()) {
      alert("Preencha todos os campos!");
      return;
    }

    const valorNumerico = Number(preco.replace(/\./g, "").replace(",", "."));

    if (isNaN(valorNumerico)) {
      alert("Digite um preço válido!");
      return;
    }

    try {
      const resposta = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          descricao: descricao.trim(),
          preco: valorNumerico,
          imagem: imagens[0] || "",
          imagens,
        }),
      });

      const novoProduto = await resposta.json();

      if (!resposta.ok) {
        alert(novoProduto.error || "Erro ao criar produto.");
        return;
      }

      setProdutos((prev) => {
        const novosProdutos = [
          ...prev,
          {
            id: novoProduto.id,
            nome: novoProduto.nome,
            descricao: novoProduto.descricao,
            preco: Number(novoProduto.preco),
            imagem: novoProduto.imagem || "",
            imagens: Array.isArray(novoProduto.imagens)
              ? novoProduto.imagens
              : [],
          },
        ];

        setPaginaProdutos(
          Math.ceil(novosProdutos.length / PRODUTOS_POR_PAGINA),
        );

        return novosProdutos;
      });

      setProdutoAdicionado(true);
      setProdutoAnimando(novoProduto.id);

      setNome("");
      setDescricao("");
      setPreco("");

      setMostrarFormulario(true);

      setTimeout(() => {
        setProdutoAdicionado(false);
      }, 1500);

      setTimeout(() => {
        setProdutoAnimando(null);
      }, 1000);
    } catch (error) {
      alert("Não foi possível conectar ao servidor.");
    }
  }

  async function excluirProduto(id: number) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este produto?",
    );

    if (!confirmar) {
      return;
    }

    try {
      const resposta = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        alert("Erro ao excluir produto.");
        return;
      }

      setProdutos((prev) => prev.filter((produto) => produto.id !== id));
    } catch (error) {
      alert("Não foi possível conectar ao servidor.");
    }
  }

  function iniciarEdicao(produto: Produto) {
    setEditandoId(produto.id);
    setNome(produto.nome);
    setDescricao(produto.descricao);

    setPreco(
      produto.preco.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );

    setDescricaoExpandida(false);
    setMostrarFormulario(true);

    setImagens(
      produto.imagens && produto.imagens.length > 0
        ? produto.imagens
        : produto.imagem
          ? [produto.imagem]
          : [],
    );
  }

  async function salvarEdicao() {
    if (!nome.trim() || !descricao.trim() || !preco.trim()) {
      alert("Preencha todos os campos!");
      return;
    }

    const valorNumerico = Number(preco.replace(/\./g, "").replace(",", "."));

    if (isNaN(valorNumerico)) {
      alert("Digite um preço válido!");
      return;
    }

    if (editandoId === null) {
      return;
    }

    try {
      const resposta = await fetch(
        `http://localhost:3000/api/products/${editandoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: nome.trim(),
            descricao: descricao.trim(),
            preco: valorNumerico,
            imagem: imagens[0] || "",
            imagens,
          }),
        },
      );

      const produtoAtualizado = await resposta.json();

      if (!resposta.ok) {
        alert(produtoAtualizado.error || "Erro ao editar produto.");
        return;
      }

      setProdutos((prev) =>
        prev.map((produto) =>
          produto.id === editandoId
            ? {
                ...produto,
                nome: produtoAtualizado.nome,
                descricao: produtoAtualizado.descricao,
                preco: Number(produtoAtualizado.preco),
                imagem: produtoAtualizado.imagem || "",
                imagens: Array.isArray(produtoAtualizado.imagens)
                  ? produtoAtualizado.imagens
                  : [],
              }
            : produto,
        ),
      );
      setNome("");
      setDescricao("");
      setPreco("");
      setEditandoId(null);
      setDescricaoExpandida(false);

      fecharFormulario();
    } catch (error) {
      alert("Não foi possível conectar ao servidor.");
    }
  }

  function renderFormularioProduto() {
    return (
      <div
        className={`form-produto formulario-produto-inline ${
          fechandoFormulario ? "fechando-formulario" : ""
        }`}
      >
        <h2>{editandoId !== null ? "Editar produto" : "Novo produto"}</h2>

        {/* NOME */}
        <div className="campo-produto-wrapper">
          <input
            type="text"
            className="campo-nome-produto"
            placeholder="Nome do produto"
            value={nome}
            maxLength={120}
            onChange={(e) => setNome(e.target.value)}
          />

          <span
            className={`contador-campo-produto ${
              nome.length >= 120
                ? "limite"
                : nome.length >= 100
                  ? "proximo-limite"
                  : ""
            }`}
          >
            {nome.length}/120
          </span>
        </div>

        {/* DESCRIÇÃO */}
        <div className="campo-descricao-cabecalho">
          <span className="campo-descricao-titulo">Descrição do produto</span>

          <button
            type="button"
            className="botao-expandir-descricao"
            onClick={() => setDescricaoExpandida(true)}
          >
            ↗ Expandir
          </button>
        </div>

        <textarea
          className="textarea-descricao-produto"
          placeholder="Descrição do produto"
          value={descricao}
          maxLength={1000}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <span
          className={`contador-campo-produto ${
            descricao.length >= 1000
              ? "limite"
              : descricao.length >= 850
                ? "proximo-limite"
                : ""
          }`}
        >
          {descricao.length}/1000
        </span>

        {/* PREÇO */}
        <input
          type="text"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

        {/* IMAGEM */}
        <input type="file" accept="image/*" onChange={selecionarImagens} />

        {/* IMAGENS DO PRODUTO */}
        <div className="campo-imagens-produto">
          <div className="campo-imagens-cabecalho">
            <span className="campo-descricao-titulo">Imagens do produto</span>

            <span className="contador-imagens-produto">
              {imagens.length} imagem{imagens.length !== 1 ? "ns" : ""}
            </span>
          </div>

          <label className="botao-selecionar-imagens">
            + Adicionar imagens
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={selecionarImagens}
            />
          </label>

          {imagens.length > 0 && (
            <div className="lista-imagens-produto">
              {imagens.map((imagemAtual, index) => (
                <div
                  className="preview-imagem-produto"
                  key={`${index}-${imagemAtual.slice(-20)}`}
                >
                  <button
                    type="button"
                    className="preview-imagem-produto-botao"
                    onClick={() => abrirImagemAmpliada(imagemAtual)}
                    aria-label={`Ampliar imagem ${index + 1}`}
                  >
                    <img src={imagemAtual} alt={`Imagem ${index + 1}`} />
                  </button>

                  {index === 0 && (
                    <span className="imagem-principal-label">Principal</span>
                  )}

                  <button
                    type="button"
                    className="remover-imagem-produto"
                    onClick={() => removerImagem(index)}
                    aria-label={`Remover imagem ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTÕES */}
        {editandoId !== null ? (
          <>
            <button
              type="button"
              className="botao-salvar"
              onClick={salvarEdicao}
            >
              Salvar alterações
            </button>

            <button
              type="button"
              className="botao-cancelar"
              onClick={fecharFormulario}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={`botao-salvar ${
                produtoAdicionado ? "produto-adicionado" : ""
              }`}
              onClick={adicionarProduto}
              disabled={produtoAdicionado}
            >
              {produtoAdicionado ? "✓ Produto adicionado!" : "Adicionar à Loja"}
            </button>

            <button
              type="button"
              className="botao-cancelar"
              onClick={fecharFormulario}
              disabled={produtoAdicionado}
            >
              Fechar
            </button>
          </>
        )}
      </div>
    );
  }

  const usuariosOrdenados = [...usuarios].sort((a, b) => {
    if (a.tipo === "admin" && b.tipo !== "admin") {
      return -1;
    }

    if (a.tipo !== "admin" && b.tipo === "admin") {
      return 1;
    }

    const aOnline = usuariosAtivos.includes(a.id);
    const bOnline = usuariosAtivos.includes(b.id);

    if (aOnline && !bOnline) {
      return -1;
    }

    if (!aOnline && bOnline) {
      return 1;
    }

    return 0;
  });

  return (
    <div className="admin">
      <div className="admin-container">
        <h1>Painel Administrativo</h1>

        {!mostrarFormulario && (
          <button
            type="button"
            className="botao-adicionar"
            onClick={abrirFormulario}
          >
            + Adicionar produto
          </button>
        )}

        {mostrarFormulario && editandoId === null && renderFormularioProduto()}

        <div className="produtos-admin">
          <h2>Produtos cadastrados</h2>

          {carregandoDados && produtos.length === 0 ? (
            <p className="carregando-dados">Carregando produtos...</p>
          ) : produtos.length === 0 ? (
            <p>Nenhum produto cadastrado.</p>
          ) : (
            <>
              <div
                className={`produtos-admin-lista quantidade-${produtosDaPagina.length}`}
                key={paginaProdutos}
              >
                {produtosDaPagina.map((produto) => (
                  <div
                    className={`produto-admin ${
                      produtoAnimando === produto.id ? "produto-novo" : ""
                    }`}
                    key={produto.id}
                  >
                    <div className="produto-info">
                      {produto.imagem ? (
                        <button
                          type="button"
                          className="produto-imagem-admin-botao"
                          onClick={() => setProdutoImagemSelecionada(produto)}
                          aria-label={`Visualizar foto de ${produto.nome}`}
                        >
                          <img
                            src={produto.imagem}
                            alt={`Foto de ${produto.nome}`}
                            className="produto-imagem-admin"
                          />
                        </button>
                      ) : (
                        <div className="produto-imagem-placeholder">
                          <span>📦</span>
                        </div>
                      )}

                      <h3>{produto.nome}</h3>

                      <p>{produto.descricao}</p>

                      <strong>
                        {produto.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </strong>
                    </div>

                    <div className="produto-acoes">
                      <button
                        type="button"
                        className="botao-editar"
                        onClick={() => iniciarEdicao(produto)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="botao-excluir"
                        onClick={() => excluirProduto(produto.id)}
                      >
                        Excluir
                      </button>
                    </div>

                    {mostrarFormulario &&
                      editandoId === produto.id &&
                      renderFormularioProduto()}
                  </div>
                ))}
              </div>

              {totalPaginasProdutos > 1 && (
                <div
                  className="paginacao-produtos"
                  aria-label="Paginação dos produtos"
                >
                  <button
                    type="button"
                    className="botao-paginacao"
                    onClick={() =>
                      setPaginaProdutos((pagina) => Math.max(1, pagina - 1))
                    }
                    disabled={paginaProdutos === 1}
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>

                  {Array.from(
                    {
                      length: totalPaginasProdutos,
                    },
                    (_, index) => index + 1,
                  ).map((pagina) => (
                    <button
                      type="button"
                      key={pagina}
                      className={`botao-pagina ${
                        paginaProdutos === pagina ? "pagina-ativa" : ""
                      }`}
                      onClick={() => setPaginaProdutos(pagina)}
                    >
                      {pagina}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="botao-paginacao"
                    onClick={() =>
                      setPaginaProdutos((pagina) =>
                        Math.min(totalPaginasProdutos, pagina + 1),
                      )
                    }
                    disabled={paginaProdutos === totalPaginasProdutos}
                    aria-label="Próxima página"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="usuarios-admin">
          <div className="usuarios-titulo">
            <h2>Usuários cadastrados</h2>

            <span className="usuarios-online-total">
              {usuariosAtivos.length} usuário(s) online
            </span>
          </div>

          {carregandoDados && usuarios.length === 0 ? (
            <p className="carregando-dados">Carregando usuários...</p>
          ) : usuarios.length === 0 ? (
            <p>Nenhum usuário cadastrado.</p>
          ) : (
            <div className="usuarios-lista">
              {usuariosOrdenados.map((usuario) => {
                const estaLogado = usuariosAtivos.includes(usuario.id);

                return (
                  <div
                    className={`usuario-admin ${
                      estaLogado ? "usuario-logado" : ""
                    }`}
                    key={usuario.id}
                  >
                    <div className="usuario-info">
                      {usuario.fotoPerfil || usuario.nome ? (
                        <button
                          type="button"
                          className="usuario-avatar usuario-avatar-botao"
                          onClick={() => setFotoUsuarioSelecionada(usuario)}
                          aria-label={`Visualizar foto de ${usuario.nome}`}
                        >
                          {usuario.fotoPerfil ? (
                            <img
                              src={usuario.fotoPerfil}
                              alt={`Foto de ${usuario.nome}`}
                            />
                          ) : (
                            <span className="avatar-inicial-admin">
                              {usuario.nome.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </button>
                      ) : (
                        <div className="usuario-avatar">
                          {usuario.nome.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <h3>{usuario.nome}</h3>

                        <p>{usuario.email}</p>

                        <span className="usuario-tipo">
                          {usuario.tipo === "admin"
                            ? "Administrador"
                            : "Usuário"}
                        </span>

                        <span className="usuario-ultimo-login">
                          Último login:{" "}
                          {formatarUltimoLogin(usuario.lastLoginAt)}
                        </span>
                      </div>
                    </div>

                    <div className="usuario-status">
                      {estaLogado ? (
                        <span className="status-online">
                          <span className="status-bolinha"></span>
                          Logado agora
                        </span>
                      ) : (
                        <span className="status-offline">Não logado</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL DA DESCRIÇÃO EXPANDIDA */}
        {descricaoExpandida && (
          <div className="descricao-produto-overlay" role="presentation">
            <section
              className="descricao-produto-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-descricao-produto"
            >
              <button
                type="button"
                className="fechar-descricao-produto"
                onClick={() => setDescricaoExpandida(false)}
                aria-label="Fechar descrição"
              >
                ×
              </button>

              <h3 id="titulo-descricao-produto">
                {editandoId !== null
                  ? "Editar descrição"
                  : "Descrição do produto"}
              </h3>

              <p>Digite ou revise a descrição completa do produto.</p>

              <textarea
                value={descricao}
                maxLength={1000}
                onChange={(e) => setDescricao(e.target.value)}
                autoFocus
              />

              <span
                className={`contador-campo-produto ${
                  descricao.length >= 1000
                    ? "limite"
                    : descricao.length >= 850
                      ? "proximo-limite"
                      : ""
                }`}
              >
                {descricao.length}/1000
              </span>

              <button
                type="button"
                className="botao-salvar-descricao-admin"
                onClick={() => setDescricaoExpandida(false)}
              >
                Concluir
              </button>
            </section>
          </div>
        )}

        {/* MODAL FOTO DO USUÁRIO */}
        {fotoUsuarioSelecionada && (
          <div className="foto-usuario-admin-overlay" role="presentation">
            <section
              className="foto-usuario-admin-modal"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="fechar-foto-usuario-admin"
                aria-label="Fechar foto do usuário"
                onClick={() => setFotoUsuarioSelecionada(null)}
              >
                ×
              </button>

              {fotoUsuarioSelecionada.fotoPerfil ? (
                <img
                  src={fotoUsuarioSelecionada.fotoPerfil}
                  alt={`Foto de ${fotoUsuarioSelecionada.nome}`}
                />
              ) : (
                <div className="avatar-inicial-admin-grande">
                  {fotoUsuarioSelecionada.nome.charAt(0).toUpperCase()}
                </div>
              )}

              <strong>{fotoUsuarioSelecionada.nome}</strong>
            </section>
          </div>
        )}

        {/* MODAL FOTO DO PRODUTO */}
        {produtoImagemSelecionada && (
          <div className="foto-usuario-admin-overlay" role="presentation">
            <section
              className="foto-usuario-admin-modal"
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                className="fechar-foto-usuario-admin"
                aria-label="Fechar foto do produto"
                onClick={() => setProdutoImagemSelecionada(null)}
              >
                ×
              </button>

              <img
                src={produtoImagemSelecionada.imagem}
                alt={`Foto de ${produtoImagemSelecionada.nome}`}
              />

              <strong>{produtoImagemSelecionada.nome}</strong>
            </section>
          </div>
        )}
        {imagemAmpliada && (
          <div
            className={`modal-imagem-ampliada ${
              fechandoImagemAmpliada ? "fechando" : ""
            }`}
            onClick={fecharImagemAmpliada}
          >
            <button
              type="button"
              className="fechar-modal-imagem"
              onClick={fecharImagemAmpliada}
              aria-label="Fechar imagem"
            >
              ×
            </button>

            <img
              src={imagemAmpliada}
              alt="Imagem ampliada do produto"
              className="imagem-ampliada"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
