import FormAnswerProvider from "@/context/FormAnswerContext";
import { FormProvider } from "@/context/FormContext";
import ElementContextProvider from "@/context/FormStepDataContext";
import type { Metadata } from "next";

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
