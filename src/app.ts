import express from "express";
import cors from "cors";
import userRouter from "./routes/user";
import companyRouter from "./routes/company";
import mechanicRouter from "./routes/mechanic";
import clientRouter from "./routes/client";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRouter);
app.use("/companies", companyRouter);
app.use("/mechanics", mechanicRouter);
app.use("/clients", clientRouter);

app.use((req, res, next) => {
  return res.status(404).json("Route not found ❌");
});

export default app;
