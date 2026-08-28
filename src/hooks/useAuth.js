import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Thin accessor hook so components never import AuthContext directly.
 * Throws early and loudly if used outside the provider, instead of
 * silently returning undefined and causing confusing null-ref bugs.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
