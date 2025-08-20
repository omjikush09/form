export const makeFirstLetterUpperCase = (data: string): string => {
	return data.slice(0, 1) + data.split("_").join(" ").slice(1).toLowerCase();
};
