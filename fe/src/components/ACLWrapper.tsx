import { ReactNode, useContext } from "react";
import { CurrentUserContext } from "../App";
import { UserRole } from "../types/User";

const ACLWrapper = ({
  allowedRoles,
  fallback,
  children,
}: {
  allowedRoles: UserRole[];
  fallback: ReactNode;
  children: ReactNode;
}) => {
  const user = useContext(CurrentUserContext);

  if (!user.role || !allowedRoles.includes(user.role)) {
    return fallback;
  }

  return children;
};

export default ACLWrapper;
