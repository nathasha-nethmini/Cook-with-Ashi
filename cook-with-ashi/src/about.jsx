import { useEffect, useState } from "react";
import "./admin.css";
import { useNavigate, Link } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const logout = () => navigate("/");

  // Fetch today's orders
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`);
      if (!res.ok) throw new Error("Failed to fetch orders");

      const data = await res.json();
      const todayString = new Date().toISOString().split("T")[0];

      const todayOrders = data
        .filter(
          order =>
            order.meal.toLowerCase() === "lunch" &&
            order.date.split("T")[0] === todayString
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setOrders(todayOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update order status
  const updateStatus = async (orderId, newStatus, whatsappURL) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (res.ok) {
        // Update frontend
        setOrders(prev =>
          prev.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
        );

        // Open WhatsApp after state update
        setTimeout(() => window.open(whatsappURL, "_blank"), 100);
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <nav>
        <Link to="/listtodeliver">Orders to Deliver</Link>
        <Link to="/post">Posts</Link>
      </nav>
      <button id="logout" onClick={logout}>
        Logout
      </button>

      <h1>Admin Home page</h1>

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
              const orderDate = new Date(order.date);
              const formattedDate = `${orderDate.getFullYear()}/${
                orderDate.getMonth() + 1
              }/${orderDate.getDate()} ${orderDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`;

              const phoneNumber = "94" + order.phone.replace(/[^0-9]/g, "");
              const whatsappConfirm = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                `Hello ${order.name}, your order for ${order.meal} has been confirmed.`
              )}`;
              const whatsappDecline = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                `Dear ${order.name}, we regret to inform you that your order for ${order.meal} has been declined.`
              )}`;

              return (
                <tr key={order._id}>
                  <td>{index + 1}</td>
                  <td>{formattedDate}</td>
                  <td>{order.name}</td>
                  <td>{order.phone}</td>
                  <td>{order.meal}</td>
                  <td>{order.address}</td>
                  <td>{order.landmark}</td>
                  <td className={`status-${order.status?.toLowerCase() || "pending"}`}>
                    {order.status || "Pending"}
                    {!order.status || order.status === "Pending" ? (
                      <div style={{ marginTop: "5px" }}>
                        <button
                          className="status1"
                          onClick={() =>
                            updateStatus(order._id, "Confirmed", whatsappConfirm)
                          }
                        >
                          Confirm
                        </button>
                        <button
                          className="status2"
                          onClick={() =>
                            updateStatus(order._id, "Declined", whatsappDecline)
                          }
                        >
                          Decline
                        </button>
                      </div>
                    ) : null}
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
