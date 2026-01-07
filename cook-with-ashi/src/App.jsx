import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Admin from "./admin";
import AdminLogin from "./AdminLogin";
import Order from "./order";
import About from "./about";
import Contact from "./contact";
import Post from "./post";
import Listtodeliver from "./listtodeliver";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/order" element={<Order />} />
        <Route path="/about" element={<About />} />
        <Route path="/post" element={<Post/>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/listtodeliver" element={<Listtodeliver/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
