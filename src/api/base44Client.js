export const db = {
  auth: {
    isAuthenticated: async () => false,
    me: async () => null,
    logout: async () => {},
    redirectToLogin: async () => {},
    loginViaEmailPassword: async () => {},
    loginWithProvider: async () => {},
    register: async () => {},
    verifyOtp: async () => ({}),
    setToken: () => {},
    resendOtp: async () => {},
    resetPassword: async () => {},
    resetPasswordRequest: async () => {},
  },
  entities: new Proxy(
    {},
    {
      get: () => ({
        filter: async () => [],
        get: async () => null,
        create: async () => ({}),
        update: async () => ({}),
        delete: async () => ({}),
      }),
    }
  ),
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: "" }),
      InvokeLLM: async () => ({ response: "" }),
      GenerateImage: async () => ({ url: "" }),
    },
  },
};

export const base44 = db;
export default db;
