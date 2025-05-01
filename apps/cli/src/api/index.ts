import storage from "@/utils/storage";
import axios from "axios";
import { BASE_URL } from "../constants";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

api.interceptors.request.use(
  async (req) => {
    const _store = await storage().catch(); // TODO:[Timi] handle error by creating alog builder
    const store = await _store.readFromStore().catch(); //same ;
    const token = store?._auth?.session?.id;
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => {
    throw error;
  }
);

export default api;
