"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import api from "@/util/axios";
import { toast } from "sonner";

// Form Settings Interface
interface FormSettings {
	backgroundColor: string;
	questionColor: string;
	descriptionColor: string;
	answerColor: string;
	buttonColor: string;
	buttonTextColor: string;
	fontFamily: string;
}

// Form Data Interface
interface FormData {
	id: string;
	title: string;
	description?: string;
	status?: string;
	settings: FormSettings;
}

// Context Interface
interface FormContextType {
	formData: FormData;
	loading: boolean;
	saving: boolean;
	error: string | null;
	updateFormData: (updates: Partial<FormData>) => void;
	updateSettings: (settings: Partial<FormSettings>) => void;
	fetchFormData: (formId: string) => Promise<void>;
	saveFormData: () => Promise<void>;
	resetForm: () => void;
}

// Default form settings
const defaultSettings: FormSettings = {
	backgroundColor: "#ffffff",
	questionColor: "#000000",
	descriptionColor: "#6b7280",
	answerColor: "#374151",
	buttonColor: "#3b82f6",
	buttonTextColor: "#ffffff",
	fontFamily: "Inter",
};

// Default form data
const defaultFormData: FormData = {
	id: "",
	title: "Untitled Form",
	description: "",
	settings: defaultSettings,
};

// Create Context
const FormContext = createContext<FormContextType | undefined>(undefined);

// Provider Component
interface FormProviderProps {
	children: ReactNode;
	initialData?: Partial<FormData>;
}

export function FormProvider({ children, initialData }: FormProviderProps) {
	const [formData, setFormData] = useState<FormData>({
		...defaultFormData,
		...initialData,
		settings: {
			...defaultSettings,
			...initialData?.settings,
		},
	});
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const updateFormData = (updates: Partial<FormData>) => {
		setFormData((prev) => ({
			...prev,
			...updates,
			updatedAt: new Date(),
		}));
	};

	const updateSettings = (settingsUpdates: Partial<FormSettings>) => {
		setFormData((prev) => ({
			...prev,
			settings: {
				...prev.settings,
				...settingsUpdates,
			},
			updatedAt: new Date(),
		}));
	};

	const fetchFormData = async (formId: string) => {
		setLoading(true);
		setError(null);
		try {
			const response = await api.get(`/form/${formId}`);
			const apiData = response.data.data;

			setFormData({
				id: apiData.id,
				title: apiData.title,
				description: apiData.description || "",
				status: apiData.status,
				settings: {
					...defaultSettings,
					// If the API returns settings, merge them with defaults
					...(apiData.settings || {}),
				},
			});
		} catch (error) {
			setError("Failed to load form data");
			toast("Failed to fetch form");
			console.error("Error fetching form:", error);
		} finally {
			setLoading(false);
		}
	};

	const saveFormData = async () => {
		if (!formData.id) {
			toast("Form ID is required to save");
			return;
		}

		setSaving(true);
		try {
			const updatePayload = {
				title: formData.title,
				description: formData.description,
				settings: formData.settings,
			};

			await api.put(`/form/${formData.id}`, updatePayload);

			// Update the updatedAt timestamp
			setFormData((prev) => ({
				...prev,
				updatedAt: new Date(),
			}));

			toast("Form design saved successfully!");
		} catch (error) {
			toast("Failed to save form design");
			console.error("Error saving form:", error);
		} finally {
			setSaving(false);
		}
	};

	const resetForm = () => {
		setFormData(defaultFormData);
	};

	const value: FormContextType = {
		formData,
		loading,
		saving,
		error,
		updateFormData,
		updateSettings,
		fetchFormData,
		saveFormData,
		resetForm,
	};

	return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

// Custom Hook
export function useFormContext() {
	const context = useContext(FormContext);
	if (!context) {
		throw new Error("useFormContext must be used within a FormProvider");
	}
	return context;
}

// Export types for external use
export type { FormData, FormSettings, FormContextType };
