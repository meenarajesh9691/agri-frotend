import { http, unwrap } from "@/lib/http";
import type { User } from "@/types";
import { ENDPOINTS as E } from "./endpoints";

export const userService = {
  list: () => unwrap<User[]>(http.get(E.users.base)),
  create: (body: { name: string; phone: string; password: string }) => unwrap<User>(http.post(E.users.base, body)),
  update: (id: string, body: { isActive?: boolean; newPassword?: string }) =>
    unwrap<User>(http.patch(E.users.byId(id), body)),
};
