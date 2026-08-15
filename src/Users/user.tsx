import { useEffect, useState } from "react";

type Usuario = {
  nome: string;
  email: string;
  senha: string;
};

function Users() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    const dados = JSON.parse(localStorage.getItem("usuarios") || "[]");

    setUsuarios(dados);
  }, []);

  return (
    <div>
      <h1>Usuarios Salvos</h1>

      {usuarios.map((user, index) => (
        <div key={index}>
          <p>Nome: {user.nome}</p>
          <p>Email: {user.email}</p>
          <p>Senha: {user.senha}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default Users;
