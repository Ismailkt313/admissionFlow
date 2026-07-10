export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
};

export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
};

export const getUser = (): any => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: any): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
};

export const removeUser = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
};

export const getRememberedEmail = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("remembered_email");
};

export const setRememberedEmail = (email: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("remembered_email", email);
};

export const removeRememberedEmail = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("remembered_email");
};

export const clearAuth = (): void => {
  removeToken();
  removeUser();
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
