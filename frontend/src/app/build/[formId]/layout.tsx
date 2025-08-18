import FormAnswerProvider from "@/components/context/FormAnswerContext";
import ElementContextProvider from "@/components/context/FormStepDataContext";
import { FormProvider } from "@/components/context/FormContext";
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
				<FormAnswerProvider>
					<div className="h-dvh w-screen">{children}</div>
				</FormAnswerProvider>
			</ElementContextProvider>
		</FormProvider>
	);
}
