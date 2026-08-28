import { useEffect, useState } from "react";
import "../Styles/Login.css";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";

type Props = {
  irParaCadastro: () => void;
  irParaHome: () => void;
  irParaAdmin: () => void;
  onLogin: (usuario: any) => void;
};

function Login({ irParaCadastro, irParaHome, irParaAdmin, onLogin }: Props) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [email, setEmail] = useState("");

  const [senha, setSenha] = useState("");

  const [lembrarUsuario, setLembrarUsuario] = useState(false);

  const [erros, setErros] = useState({
    email: "",
    senha: "",
  });

  useEffect(() => {
    async function carregarUltimoLogin() {
      try {
        const resposta = await fetch("http://localhost:3000/api/users");

        if (!resposta.ok) {
          return;
        }

        const usuarios = await resposta.json();
        const usuarioSalvo = usuarios.find(
          (usuario: any) => usuario.rememberedEmail || usuario.rememberedPassword,
        );

        if (!usuarioSalvo) {
          return;
        }

        setEmail(usuarioSalvo.rememberedEmail || "");
        setSenha(usuarioSalvo.rememberedPassword || "");
        setLembrarUsuario(Boolean(usuarioSalvo.rememberedEmail));
      } catch (error) {
        console.error("Erro ao carregar último login salvo:", error);
      }
    }

    carregarUltimoLogin();
  }, []);

  async function handleLogin() {
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

    setErros({
      email: "",
      senha: "",
    });

    setCarregando(true);

    try {
      const resposta = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha,
          lembrarUsuario,
        }),
      });

      const usuario = await resposta.json();

      if (!resposta.ok) {
        setCarregando(false);
        setErros({
          email: "",
          senha: usuario.error || "E-mail ou senha incorretos",
        });

        return;
      }

      console.log("Usuário logado:", usuario);
      onLogin(usuario);

      if (usuario.tipo === "admin") {
        irParaAdmin();
      } else {
        irParaHome();
      }
    } catch (error) {
      setCarregando(false);
      setErros({
        email: "",
        senha: "Não foi possível conectar ao servidor.",
      });
    }
  }

  return (
    <div className={`login-inputs ${carregando ? "login-carregando" : ""}`}>
      {carregando && (
        <div className="loading-screen-login">
          <div className="loader-login"></div>
          <p>Entrando</p>
        </div>
      )}

      <div className={`login-form-content ${carregando ? "oculta" : ""}`}>
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
            <label className={`check-lembrar ${lembrarUsuario ? "checked" : ""}`}>
              <input
                type="checkbox"
                checked={lembrarUsuario}
                onChange={(e) => setLembrarUsuario(e.target.checked)}
              />

              <span className="checkmark" aria-hidden="true"></span>
              <span className="check-text">Lembrar último Usuário</span>
            </label>
          </div>
        </div>

        <div className="container-button">
          <div className="container-button">
            <button
              className="botao-container"
              onClick={handleLogin}
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
