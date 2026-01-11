import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";

export default function Order() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState("");
  const [meal, setMeal] = useState("");
  const [menuList, setMenuList] = useState([]); // store menu from DB
  const navigate = useNavigate();
  
  const home = () => {
    navigate("/");
  };

  // Fetch menu from backend
  const fetchMenu = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/menu`);
      const data = await res.json();
      setMenuList(data);

      // Set default meal to first item if not set
      if (data.length > 0 && !meal) setMeal(data[0].name);
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const submitOrder = async (e) => {
    e.preventDefault();
    const orderData = { name, address, landmark, phone, meal };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        // Show SweetAlert2 popup
        Swal.fire({
          title: "Order Received!",
          html: `Thank you! Your order has been received.<br><b>We will contact you within 10 minutes via WhatsApp to confirm if we can deliver.</b>`,
          icon: "success",
          confirmButtonText: "OK",
          customClass: { popup: "popup-large-text" },
        });

        // Clear form
        setName("");
        setAddress("");
        setLandmark("");
        setPhone("");
        if (menuList.length > 0) setMeal(menuList[0].name);
      } else {
        Swal.fire({
          title: "Failed",
          text: "Failed to submit order. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "Server not reachable. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="order">
      
      <button id="logout" onClick={home}>
        Home
      </button>
      <div className="orderform">
        <video autoPlay loop muted className="bg-videoform">
        <source src="/kitchen.mp4" type="video/mp4" />
      </video>
        <h2>Place an Order</h2>
        <p>Choose your meal and complete the order form.</p>
        <form onSubmit={submitOrder}>
          <label>
            Name
            <input
              type="text"
              value={name}
              placeholder="Your Name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <br />

          <label>
            Address
            <input
              type="text"
              value={address}
              placeholder="Address for delivery"
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </label>
          <p className="note">
            * Enter the delivery address clearly.
          </p>
         

          <label>
            Landmark
            <input
              type="text"
              value={landmark}
              placeholder="Ex: School, Temple"
              onChange={(e) => setLandmark(e.target.value)}
            />
          </label>
          <br />

          <label>
            Phone
            <input
              type="tel"
              value={phone}
              placeholder="07X XXX XXXX"
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>
          <br />
          <p className="note">
            * Enter a valid phone number. You will get a WhatsApp message when your order is confirmed, and a call when the food is delivered.
          </p>

          <label>
            Meal
            <select value={meal} onChange={(e) => setMeal(e.target.value)}>
              {menuList.map((item) => (
                <option key={item._id} value={item.name}>
                  {item.name} (Rs. {item.price})
                </option>
              ))}
            </select>
          </label>
          <br />
          <br />

          <label>
            Order Status <input type="text" value="Pending..." readOnly />
          </label>
          <br />
          <button type="submit">Submit Order</button>
        </form>
      </div>

      {/* ALL MENU ITEMS */}
  
      <h2 style={{ textAlign: "center", marginTop: "3rem" }}>All Menu Items</h2>
      <div className="menu-list">
        {menuList.length === 0 && <p style={{ textAlign: "center" }}>No menu items yet</p>}
        {menuList.map((item) => (
          <div className="menu-card" key={item._id}>
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <p>Price: Rs. {item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}