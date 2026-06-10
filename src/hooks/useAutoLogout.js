import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAutoLogout = (token) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const decoded = jwtDecode(token);
    const expiryTime = decoded.exp * 1000;
    const timeout = expiryTime - Date.now();

    const logout = () => {
      localStorage.removeItem("token");

      toast.error("Session expired! Please login again 👋");

      navigate("/login");
    };

    if (timeout <= 0) {
      logout();
      return;
    }

    const timer = setTimeout(() => {
      logout();
    }, timeout);

    return () => clearTimeout(timer);
  }, [token, navigate]);
};

export default useAutoLogout;