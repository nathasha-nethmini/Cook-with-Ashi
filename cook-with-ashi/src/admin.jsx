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

  // Update order status in backend & frontend
  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      // Update frontend state immediately
      setOrders(
        orders.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`);
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();

        const today = new Date();
        const todayString = today.toISOString().split("T")[0];

        // Filter only lunch orders of today and sort by time
        const adminOrders = data
          .filter(
            (order) =>
              order.meal.toLowerCase() === "lunch" &&
              order.date.split("T")[0] === todayString
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setOrders(adminOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Refresh every 10 sec
    return () => clearInterval(interval);
  }, []);

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
              const phoneNumber = "94" + order.phone.replace(/[^0-9]/g, "");

              const message1 = encodeURIComponent(
                `Hello ${order.name}, your order for ${order.meal} has been confirmed.`
              );
              const message2 = encodeURIComponent(
                `Dear ${order.name}, we regret to inform you that your order for ${order.meal} has been canceled due to unavoidable circumstances. We sincerely apologize for the inconvenience.`
              );
              const whatsappURL1 = `https://wa.me/${phoneNumber}?text=${message1}`;
              const whatsappURL2 = `https://wa.me/${phoneNumber}?text=${message2}`;

              const orderDate = new Date(order.date);
              const formattedDate = `${orderDate.getFullYear()}/${
                orderDate.getMonth() + 1
              }/${orderDate.getDate()} ${orderDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`;

              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{formattedDate}</td>
                  <td>{order.name}</td>
                  <td>{order.phone}</td>
                  <td>{order.meal}</td>
                  <td>{order.address}</td>
                  <td>{order.landmark}</td>
                  <td className="status">
                    {/* Show current status if confirmed or declined */}
                    {order.status === "Confirmed" && (
                      <span className="confirmed">Confirmed</span>
                    )}
                    {order.status === "Declined" && (
                      <span className="declined">Declined</span>
                    )}

                    {/* Show buttons only if status is Pending or undefined */}
                    {!order.status || order.status === "Pending" ? (
                      <>
                        <a
                          href={whatsappURL1}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            updateStatus(order._id, "Confirmed")
                          }
                        >
                          <button className="status1">Confirm</button>
                        </a>

                        <a
                          href={whatsappURL2}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => updateStatus(order._id, "Declined")}
                        >
                          <button className="status2">Decline</button>
                        </a>
                      </>
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
