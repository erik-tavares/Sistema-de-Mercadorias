import { useEffect, useState } from "react";

type Usuario = {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  tipo?: string;
};

function Users() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const resposta = await fetch("http://localhost:3000/api/users");

        if (!resposta.ok) {
          setUsuarios([]);
          return;
        }

        const dados = await resposta.json();
        const usuariosFormatados = dados.map((usuario: any) => ({
          id: usuario.id,
          nome: usuario.nome || usuario.name,
          email: usuario.email,
          tipo: usuario.tipo || "cliente",
        }));

        setUsuarios(usuariosFormatados);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      } finally {
        setCarregando(false);
      }
    }

    carregarUsuarios();
  }, []);

  return (
    <div>
      <h1>Usuarios Salvos</h1>

      {carregando && usuarios.length === 0 ? (
        <p>Carregando usuários...</p>
      ) : (
        usuarios.map((user, index) => (
          <div key={user.id ?? index}>
            <p>Nome: {user.nome}</p>
            <p>Email: {user.email}</p>
            {user.tipo && <p>Tipo: {user.tipo}</p>}
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Users;
