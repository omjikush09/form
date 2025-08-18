import express from "express";
import cors from "cors";
import "dotenv/config";
//Router
import userRouter from "./modules/user/user.router.js";
import formRouter from "./modules/form/form.router.js";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get("/", (req, res) => {
	res.send("Hello dhnkj");
});

app.use("/user", userRouter);
app.use("/form", formRouter);

const PORT = process.env.PORT ?? "8000";
app.listen(PORT, () => {
	console.log(`Server is starting to listen on ${PORT}`);
});
