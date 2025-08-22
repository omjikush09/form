import ElementContextProvider from "@/context/FormStepDataContext";
import { FormProvider } from "@/context/FormContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Fermion Form",
	description: "Built by team",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<FormProvider>
			<ElementContextProvider>
				<div className="h-dvh w-screen">{children}</div>
			</ElementContextProvider>
		</FormProvider>
	);
}
