"use client";

import { FormStepContext } from "@/components/context/FormStepDataContext";
import { useContext } from "react";

export const useFormStepData = () => {
	const context = useContext(FormStepContext);
	if (!context) {
		throw new Error("FormStepContext must be used within ContextProvider");
	}
	return context;
};
