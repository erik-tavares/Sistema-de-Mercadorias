import { useState } from "react";
import "../Styles/CreateUser.css";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";

type Props = {
  voltar: () => void;
};

function CreateUser({ voltar }: Props) {
  const [erros, setErros] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarSenhaConfirmar, setMostrarSenhaConfirmar] = useState(false);

  function handleCadastro() {
    const novosErros = {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    };

    if (!nome.trim()) {
      novosErros.nome = "Nome é obrigatório!";
    }

    if (!email.trim()) {
      novosErros.email = "E-mail é obrigatório!";
    }

    if (!senha) {
      novosErros.senha = "Senha é obrigatória!";
    }

    if (!confirmarSenha) {
      novosErros.confirmarSenha = "Confirme sua senha!";
    }

    if (senha && confirmarSenha && senha !== confirmarSenha) {
      novosErros.confirmarSenha = "As senhas não são iguais";
    }

    setErros(novosErros);

    if (Object.values(novosErros).some((erro) => erro !== "")) {
      return;
    }

    const dados = localStorage.getItem("usuarios");
    const usuarios = dados ? JSON.parse(dados) : [];
    const existe = usuarios.some((u: any) => u.email === email);

    if (existe) {
      setErros({
        ...novosErros,
        email: "Esse e-mail já está cadastrado",
      });

      return;
    }

    const novoUsuario = {
      nome,
      email,
      senha,
      tipo: "cliente",
    };

    usuarios.push(novoUsuario);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Usuário criado com sucesso!");

    voltar();
  }

  return (
    <div className="create-user">
      <form
        className="create-user-container"
        onSubmit={(e) => {
          e.preventDefault();
          handleCadastro();
        }}
        noValidate
      >
        <h1>Novo Usuário</h1>
        <div className={`input-group ${nome ? "preenchido" : ""}`}>
          <input
            type="text"
            required
            placeholder=""
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setErros((prev) => ({ ...prev, nome: "" }));
            }}
          />
          <label>Nome</label>
          {erros.nome && <span className="mensagem-erro">{erros.nome}</span>}
        </div>
        <div className={`input-group ${email ? "preenchido" : ""}`}>
          <input
            type="email"
            placeholder=""
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErros((prev) => ({ ...prev, email: "" }));
            }}
          />
          <label>E-mail</label>
          {erros.email && <span className="mensagem-erro">{erros.email}</span>}
        </div>
        <div className={`input-group ${senha ? "preenchido" : ""}`}>
          <input
            type={mostrarSenha ? "text" : "password"}
            placeholder=""
            required
            value={senha}
            onChange={(e) => {
              setSenha(e.target.value);
              setErros((prev) => ({ ...prev, senha: "" }));
            }}
          />
          <label>Senha</label>
          <button
            type="button"
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="toggle-senhaConfirma"
          >
            {mostrarSenha ? <IoEyeOff /> : <IoEye />}
          </button>
          {erros.senha && <span className="mensagem-erro">{erros.senha}</span>}
        </div>
        <div className={`input-group ${confirmarSenha ? "preenchido" : ""}`}>
          <input
            type={mostrarSenhaConfirmar ? "text" : "password"}
            required
            placeholder=""
            value={confirmarSenha}
            onChange={(e) => {
              setConfirmarSenha(e.target.value);
              setErros((prev) => ({ ...prev, confirmarSenha: "" }));
            }}
          />
          <label>Confirmar senha</label>
          <button
            type="button"
            onClick={() => setMostrarSenhaConfirmar(!mostrarSenhaConfirmar)}
            className="toggle-senhaConfirma"
          >
            {mostrarSenhaConfirmar ? <IoEyeOff /> : <IoEye />}
          </button>
          {erros.confirmarSenha && (
            <span className="mensagem-erro">{erros.confirmarSenha}</span>
          )}
        </div>
        <div className="create-user-buttons">
          <button className="botao-voltar" type="button" onClick={voltar}>
            Voltar
          </button>
          <button className="botao-criar" type="submit">
            Criar conta
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateUser;
