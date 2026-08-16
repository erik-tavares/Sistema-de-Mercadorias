import { useState } from "react";
import "../Styles/Login.css";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";

type Props = {
  irParaCadastro: () => void;
  irParaHome: () => void;
  irParaAdmin: () => void;
};

function Login({ irParaCadastro, irParaHome, irParaAdmin }: Props) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [carregando, setCarregando] = useState(false);

  const [email, setEmail] = useState(() => {
    return localStorage.getItem("ultimoUsuario") || "";
  });

  const [senha, setSenha] = useState(() => {
    return localStorage.getItem("ultimaSenha") || "";
  });

  const [lembrarUsuario, setLembrarUsuario] = useState(() => {
    return localStorage.getItem("lembrarUsuario") === "true";
  });

  const [erros, setErros] = useState({
    email: "",
    senha: "",
  });

  function handleLogin() {
    const novosErros = {
      email: "",
      senha: "",
    };

    if (!email.trim()) {
      novosErros.email = "E-mail é obrigatório";
    }

    if (!senha) {
      novosErros.senha = "Senha é obrigatória";
    }

    if (Object.values(novosErros).some((erro) => erro !== "")) {
      setErros(novosErros);
      return;
    }

    const dados = localStorage.getItem("usuarios");
    const usuarios = dados ? JSON.parse(dados) : [];

    const usuario = usuarios.find(
      (u: any) => u.email === email && u.senha === senha,
    );

    if (!usuario) {
      setErros({
        email: "",
        senha: "E-mail ou senha incorretos",
      });

      return;
    }

    setErros({
      email: "",
      senha: "",
    });

    if (usuario.tipo === "admin") {
      irParaAdmin();
    } else {
      irParaHome();
    }

    if (lembrarUsuario) {
      localStorage.setItem("ultimoUsuario", email);
      localStorage.setItem("ultimaSenha", senha);
      localStorage.setItem("lembrarUsuario", "true");
    } else {
      localStorage.removeItem("ultimoUsuario");
      localStorage.removeItem("ultimaSenha");
      localStorage.removeItem("lembrarUsuario");
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    console.log("Usuário logado:", usuario);

    if (usuario.tipo === "admin") {
      irParaAdmin();
    } else {
      irParaHome();
    }
  }

  return (
    <div className="login-inputs">
      {carregando && (
        <div className="loading-screen-login">
          <div className="loader-login"></div>
          <p>Entrando...</p>
        </div>
      )}

      <div>
        <div className="inputs-container">
          <div className="text-login">
            <h1>Login</h1>
          </div>

          <div className={`input-group ${email ? "preenchido" : ""}`}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);

                setErros((prev) => ({
                  ...prev,
                  email: "",
                }));
              }}
            />

            <label>E-mail</label>

            {erros.email && (
              <span className="mensagem-erro">{erros.email}</span>
            )}
          </div>

          <div className={`input-group ${senha ? "preenchido" : ""}`}>
            <input
              type={mostrarSenha ? "text" : "password"}
              required
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);

                setErros((prev) => ({
                  ...prev,
                  senha: "",
                }));
              }}
            />

            <label>Senha</label>

            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="toggle-senha"
            >
              {mostrarSenha ? <IoEyeOff /> : <IoEye />}
            </button>

            {erros.senha && (
              <span className="mensagem-erro">{erros.senha}</span>
            )}
          </div>

          <div className="lembrar-usuario">
            <label>
              <input
                type="checkbox"
                checked={lembrarUsuario}
                onChange={(e) => setLembrarUsuario(e.target.checked)}
              />

              <span>Lembrar último Usuário</span>
            </label>
          </div>
        </div>

        <div className="container-button">
          <div className="container-button">
            <button
              className="botao-container"
              onClick={() => {
                setCarregando(true);

                setTimeout(() => {
                  handleLogin();
                }, 2500);
              }}
              disabled={carregando}
            >
              Entrar
            </button>
          </div>
        </div>

        <div className="tittle-submenu">
          <h4>
            Não tem conta? Crie uma agora!
            <br />
            <span className="link" onClick={irParaCadastro}>
              Clique Aqui!
            </span>
          </h4>
        </div>
      </div>
    </div>
  );
}

export default Login;
