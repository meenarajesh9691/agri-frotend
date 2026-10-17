import { http, unwrap } from "@/lib/http";
import { ENDPOINTS as E } from "./endpoints";

export const settingsService = {
  update: (body: { blockOversell?: boolean; paperSize?: string; billHeader?: string; billFooter?: string }) => unwrap<unknown>(http.patch(E.settings, body)),
};
