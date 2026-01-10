import { useState, useEffect } from "react";

export default function Order() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState("");
  const [meal, setMeal] = useState("");
  const [menuList, setMenuList] = useState([]); // store menu from DB

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
    const orderData = {
      name,
      address,
      landmark,
      phone,
      meal
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert(
          "Your order has been successfully sent to the admin. ✅You will be notified via WhatsApp within 10 minutes. Thank you!"
        );
        // Clear form
        setName("");
        setAddress("");
        setLandmark("");
        setPhone("");
        if (menuList.length > 0) setMeal(menuList[0].name);
      } else {
        alert("Failed to submit order");
      }
    } catch (err) {
      console.error(err);
      alert("Server not reachable");
    }
  };

  return (
    <div className="order">
      <div className="orderform">
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
          <br />

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
            * Please add a valid number. You will receive a call once the order is delivered.
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
          <button type="submit">Submit Order</button>
        </form>
      </div>

      <div className="menucolumn">
        <h3>Today’s Menu</h3>
        <div className="todaymenu">
          {menuList.length === 0 && <p>No menu items available today.</p>}
          {menuList.map((item) => (
            <div key={item._id} className="menu-card">
              <img
                src={item.image}
                alt={item.name}
                className="menu-image"
              />
              <h4>{item.name}</h4>
              <p>Price: Rs. {item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
