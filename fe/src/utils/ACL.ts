import { UserRole } from "../types/User";

export const ACL = {} satisfies Record<string, { allowedRoles: UserRole[] }>;
