import { useFormContext } from "react-hook-form";

export const useReactFormHookContext = () => {
	try {
		return useFormContext();
	} catch {
		return null;
	}
};
