const TOKEN_KEY = "token";

export const authStorage = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem("user");
  },
  isAuthenticated: () => !!sessionStorage.getItem(TOKEN_KEY),
};