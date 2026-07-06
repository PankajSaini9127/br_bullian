import { jwtDecode } from "jwt-decode";

export const getTokenExpiry = (token) => {
  if (!token) return null;

  const decoded = jwtDecode(token);
  return decoded.exp * 1000; // seconds → milliseconds
};