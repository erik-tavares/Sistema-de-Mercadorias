// import express from "express";
// import cors from "cors";
// import userRoutes from "./routes/userRoutes.js";
// import productRoutes from "./routes/productRoutes.js";

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// app.use("/api", userRoutes);
// app.use("/api", productRoutes);

// app.listen(PORT, () => {
//   console.log(`Servidor rodando com sucesso na porta ${PORT}`);
// });

// export default app;

import "dotenv/config";

import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

app.get("/", (req, res) => {
  res.json({
    message: "API funcionando!",
  });
});

app.use("/api", userRoutes);
app.use("/api", productRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
