import api from ".";

export interface LoginData {
  userName: string;
  machineName: string;
  operatingSystem: string;
}

export interface LoginResponse {
  id: string;
  phrase: string;
  expiresAt: string;
}

export const initializeLogin = (data: LoginData) => {
  return api.post<LoginResponse>("/cli/login", data);
};

interface VerifyLoginData {
  auth_phrase_id: string;
}

interface VerifyLoginResponse {
  token: string;
}
export const verifyLogin = (data: VerifyLoginData) => {
  return api.get<VerifyLoginResponse>("/cli/verify", {
    params: data,
  });
};
