import { useState } from "react";

export default function Order() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState("");
  const [meal, setMeal] = useState("Rice & Curry");

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
      const res = await fetch("http://localhost:5000/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert("Order is pending. You will receive a message once confirmed.");
        // ✅ clear form
        

        setName("");
        setAddress("");
        setLandmark("");
        setPhone("");
        setMeal("Rice & Curry");
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
          </label><br/>

          <label>
            Address
            <input
              type="text"
              value={address}
              placeholder="Address for delivery"
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </label><br/>

          <label>
            Landmark
            <input
              type="text"
              value={landmark}
              placeholder="Ex: School, Temple"
              onChange={(e) => setLandmark(e.target.value)}
            />
          </label><br/>

          <label>
            Phone
            <input
              type="tel"
              value={phone}
              placeholder="07X XXX XXXX"
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label><br/>
          <p className="note"> * Please add a valid number. You will receive a call once the order is delivered. </p>
          <label>
            Meal
            <select
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
            >
              <option>Rice & Curry</option>
              <option>Vegetarian Plate</option>
              <option>Snack Box</option>
            </select>
          </label><br/><br/>
          <label> Order Status <input type="text" value="Pending..." readOnly /> </label>
          <button type="submit">Submit Order</button>
        </form>
      </div>
      <div className="menucolumn"> <h3>Today’s Menu</h3> <div className="todaymenu"></div> </div>
    </div>
  );
}
