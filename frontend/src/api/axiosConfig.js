import axios from "axios";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/mindmaps",
  timeout: 600000,
});

export const setupAxiosInterceptors = (logout) => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (
        error.response &&
        (error.response.status === 401 ||
          error.response.data === "Invalid or missing token")
      ) {
        logout();
      }
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;
