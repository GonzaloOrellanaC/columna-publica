export const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/ñ/g, "n") // Replace ñ with n
    .replace(/\s+/g, "_"); // Replace spaces with _
};
