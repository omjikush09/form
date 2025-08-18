import express, { Router } from "express";
import { userCreateService } from "./user.service.js";

const router: Router = express.Router();

router.post("/", async (req, res) => {
	try {
		console.log("hdafd");
		const data = await userCreateService();
		res.json({
			data: "User is created success fully",
		});
	} catch (error) {
		res.json({
			error: error,
		});
	}
});

export default router;
