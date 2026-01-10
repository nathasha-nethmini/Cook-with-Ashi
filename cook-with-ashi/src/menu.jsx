import { useEffect, useState } from "react";
import "./admin.css";

function Menu() {
  const [menuList, setMenuList] = useState([]);

  // Fetch available menu from backend
  const fetchMenu = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/menu`);
      const data = await res.json();
      setMenuList(data);
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  return (<>
    <h2 style={{textAlign:"center"}}>Available Menu for today</h2><br/>
      <div className="menu-list">
        {menuList.length === 0 && <p style={{ textAlign: "center" }}>No menu items available today.</p>}

        {menuList.map((item) => (
          <div className="menu-card" key={item._id}>
            <img
              src={item.image}
              alt={item.name}
              className="menu-image"
            />
            <h3>{item.name}</h3>
            <p>Price: Rs. {item.price}</p>
          </div>
        ))}
      
    </div></>
  );
}

export default Menu;
