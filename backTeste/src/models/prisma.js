import prismaModule from "../generated/client/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const { PrismaClient } = prismaModule;

// Cria o pool de conexão nativo do PostgreSQL usando a string do seu .env
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Instancia o Prisma usando o adaptador obrigatório da v7
const prisma = new PrismaClient({ adapter });

export default prisma;
