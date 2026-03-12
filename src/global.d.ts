declare module '*.css';

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	// otras variables de entorno VITE pueden agregarse aquí
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}