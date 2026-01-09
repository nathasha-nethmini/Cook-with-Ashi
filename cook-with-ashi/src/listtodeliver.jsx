import { useEffect, useState } from "react";
import "./admin.css";
import { useNavigate, Link } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    navigate("/");
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders"); // Make sure backend is running
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const adminOrders = data.filter(order => 
            order.meal !== "Vegetarian Plate" &&
            new Date(order.date) >= thirtyDaysAgo
        )  .sort((a, b) => new Date(b.date) - new Date(a.date));

        setOrders(adminOrders);

      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10 seconds
    return () => clearInterval(interval); // Cleanup
  }, []);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <nav>
        <Link to="/admin">Admin Page</Link>
        <Link to="/post">Posts</Link>
      </nav>
      <button id="logout" onClick={logout}>Logout</button>

      <h1>Orders to deliver later</h1>

      {orders.length === 0 ? (
        <p>No orders</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Time</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Meal</th>
              <th>Address</th>
              <th>Landmark</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => {
              // Prepare WhatsApp URL for this order
              const phoneNumber = "94" + order.phone.replace(/[^0-9]/g, "");

              const message1 = encodeURIComponent(
                `Hello ${order.name}, your order for ${order.meal} has been confirmed.`
                );
              const message2 = encodeURIComponent(
                `Dear ${order.name}, we regret to inform you that your order for ${order.meal} has been canceled due to unavoidable circumstances. We sincerely apologize for the inconvenience.`
              );
                const whatsappURL1 = `https://wa.me/${phoneNumber}?text=${message1}`;
                const whatsappURL2 = `https://wa.me/${phoneNumber}?text=${message2}`;

              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {(() => {
                      const orderDate = new Date(order.date);
                      return `${orderDate.getFullYear()}/${orderDate.getMonth() + 1}/${orderDate.getDate()} 
                      ${orderDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                    })()}
                  </td>
                  <td>{order.name}</td>
                  <td>{order.phone}</td>
                  <td>{order.meal}</td>
                  <td>{order.address}</td>
                  <td>{order.landmark}</td>
                  <td className="status">
                    {/* Confirm button opens WhatsApp draft for this user */}
                    <a href={whatsappURL1} target="_blank" rel="noopener noreferrer">
                      <button className="status1">Confirm</button>
                    </a>
                    <a href={whatsappURL2} target="_blank" rel="noopener noreferrer"><button className="status2">Decline</button></a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Admin;
