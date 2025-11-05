import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

let ProtectedRoute = ({ children }) => {
  let token = localStorage.getItem("token");
  let navigate = useNavigate();
  useEffect(() => {
    if (token) {
      try {
        let { exp } = jwtDecode(token);
        exp = exp * 1000;
        if (Date.now() >= exp) {
          token = null;
          localStorage.removeItem("token");
          navigate("/login");
        }
        // console.log(token,"dd")
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [token, navigate]);
  return token ? children : null;
};
export default ProtectedRoute;
