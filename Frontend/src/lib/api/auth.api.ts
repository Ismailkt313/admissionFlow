import { apiInstance } from "./axios";
import { User, LoginResponse } from "./types";

export const authApi = {
  async register(name: string, email: string, password: string): Promise<User> {
    const { data } = await apiInstance.post<User>("/auth/register", { name, email, password });
    return data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiInstance.post<LoginResponse>("/auth/login", { email, password });
    return data;
  },

  async profile(): Promise<User> {
    const { data } = await apiInstance.get<User>("/auth/profile");
    return data;
  },
};
