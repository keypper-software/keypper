import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.BASE_URL}/api`,
});

api.interceptors.request.use(
  (req) => {
    const token = "";
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
