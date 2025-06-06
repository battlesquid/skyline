/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_NAME: string;
	readonly VITE_WORKER_URL: string;
	readonly VITE_WORKER_ENTERPRISE_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
