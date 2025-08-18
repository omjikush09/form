import { db } from "../../db/index.js";


export const userCreateService = async () => {
	try {
		return await db.insertInto("User").values({}).execute();
	} catch (error) {
		console.error(error);
		throw error;
	}
};
