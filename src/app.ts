import express from "express";
import cors from "cors";
import userRouter from "./routes/user";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRouter);

app.use((req, res, next) => {
  return res.status(404).json("Route not found ❌");
});

export default app;
