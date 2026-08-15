import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Admin from "./admin";
import AdminLogin from "./AdminLogin";
import Order from "./order";
import About from "./about";
import Contact from "./contact";
import Post from "./post";
import Listtodeliver from "./listtodeliver";


function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/admin-login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/order" element={<Order />} />
        <Route path="/about" element={<About />} />
        <Route path="/post" element={<ProtectedRoute><Post/></ProtectedRoute>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/listtodeliver" element={<ProtectedRoute><Listtodeliver/></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
