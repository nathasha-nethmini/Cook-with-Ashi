import "./admin.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Post() {
  const [image, setImage] = useState(null);
  const [menuName, setMenuName] = useState("");
  const [menuPrice, setMenuPrice] = useState("");
  const [menuList, setMenuList] = useState([]); // All posts/menu items

  // Fetch all menu items from backend
  const fetchMenu = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/menu");
      const data = await res.json();
      setMenuList(data);
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const addMenu = async () => {
    if (!menuName || !menuPrice || !image) {
      alert("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", menuName);
    formData.append("price", menuPrice);
    formData.append("image", image);

    try {
      const res = await fetch("http://localhost:5000/api/menu", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Menu added successfully!");
        setMenuName("");
        setMenuPrice("");
        setImage(null);
        fetchMenu(); // Refresh menu list after adding
      } else {
        alert(data.error || "Failed to add menu");
      }
    } catch (err) {
      alert("Server error");
    }
  };

  const deleteMenu = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/menu/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        alert("Menu deleted successfully!");
        setMenuList(menuList.filter((item) => item._id !== id));
      } else {
        alert(data.message || "Failed to delete menu item");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <>
      <nav>
        <Link to="/listtodeliver">List to Deliver</Link>
        <Link to="/admin">Orders</Link>
      </nav>

      {/* ADD MENU CARD */}
      <div className="menu-card">
        <h2>Add New Menu</h2>
        <div className="image-box">
          {image ? (
            <img src={URL.createObjectURL(image)} alt="preview" />
          ) : (
            <p className="placeholder">Upload Image</p>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className="details">
          <input
            type="text"
            placeholder="Menu name"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Price (Rs.)"
            value={menuPrice}
            onChange={(e) => setMenuPrice(e.target.value)}
          />

          <button onClick={addMenu}>Add Menu</button>
        </div>
      </div>

      {/* ALL MENU ITEMS */}
      <h2 style={{ textAlign: "center", marginTop: "30px" }}>All Menu Items</h2>
      <div className="menu-list">
        {menuList.length === 0 && <p style={{ textAlign: "center" }}>No menu items yet</p>}
        {menuList.map((item) => (
          <div className="menu-card" key={item._id}>
            <img
              src={`http://localhost:5000/uploads/${item.image}`}
              alt={item.name}
            />
            <h3>{item.name}</h3>
            <p>Price: Rs. {item.price}</p>
            <button
              className="delete-btn"
              onClick={() => deleteMenu(item._id)}
              style={{ marginTop: "10px" }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default Post;
