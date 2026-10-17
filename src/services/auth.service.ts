import { http, unwrap } from "@/lib/http";
import { clearToken, setToken } from "@/lib/token";
import type { Me, User } from "@/types";
import { ENDPOINTS as E } from "./endpoints";

export const authService = {
  async login(body: { mobileNumber: string; password: string }) {
    const res = await unwrap<{ token: string; user: User }>(http.post(E.auth.login, body));
    setToken(res.token);
    return res;
  },
  me: () => unwrap<Me>(http.get(E.auth.me)),
  async changePassword(body: { currentPassword: string; newPassword: string }) {
    const res = await unwrap<{ token: string }>(http.post(E.auth.changePassword, body));
    setToken(res.token); // purana token ab bekaar hai, naya rakh lo
  },
  logout: () => clearToken(),
};
