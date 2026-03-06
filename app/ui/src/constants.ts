// En Docker el compose inyecta VITE_API_URL. Si corres la UI en el host (npm run dev), usa 5001 donde está la API.
export const URL_API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5001/api";
