import { useEffect, useState } from "react";
import "./admin.css";
import { useNavigate, Link } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- LOGOUT ---------- */
  const logout = () => {
    navigate("/");
  };

  /* ---------- UPDATE ORDER STATUS ---------- */
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) throw new Error("Failed to update status");

      // Update UI immediately
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update order status");
    }
  };

  /* ---------- FETCH ORDERS ---------- */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders`
        );
        const data = await res.json();

        const today = new Date().toISOString().split("T")[0];

        const todayLunchOrders = data
          .filter(
            (order) =>
              order.meal?.toLowerCase() === "lunch" &&
              order.date?.split("T")[0] === today
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setOrders(todayLunchOrders);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading orders...</p>;

  /* ---------- UI ---------- */
  return (
    <div style={{ padding: "20px" }}>
      <nav>
        <Link to="/listtodeliver">Orders to Deliver</Link>
        <Link to="/post">Posts</Link>
      </nav>

      <button id="logout" onClick={logout}>
        Logout
      </button>

      <h1>Admin Dashboard</h1>

      {orders.length === 0 ? (
        <p>No orders today</p>
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
              const phoneNumber =
                "94" + order.phone.replace(/[^0-9]/g, "");

              const confirmMsg = encodeURIComponent(
                `Hello ${order.name}, your order for ${order.meal} has been confirmed.`
              );

              const declineMsg = encodeURIComponent(
                `Dear ${order.name}, we regret to inform you that your order for ${order.meal} has been declined.`
              );

              const whatsappConfirm = `https://wa.me/${phoneNumber}?text=${confirmMsg}`;
              const whatsappDecline = `https://wa.me/${phoneNumber}?text=${declineMsg}`;

              const date = new Date(order.date);
              const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
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
                  <td className="status">
                    {order.status === "Confirmed" && (
                      <span className="confirmed">Confirmed</span>
                    )}

                    {order.status === "Declined" && (
                      <span className="declined">Declined</span>
                    )}

                    {(!order.status || order.status === "Pending") && (
                      <>
                        <button
                          className="status1"
                          onClick={() => {
                            updateStatus(order._id, "Confirmed");
                            window.open(whatsappConfirm, "_blank");
                          }}
                        >
                          Confirm
                        </button>

                        <button
                          className="status2"
                          onClick={() => {
                            updateStatus(order._id, "Declined");
                            window.open(whatsappDecline, "_blank");
                          }}
                        >
                          Decline
                        </button>
                      </>
                    )}
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
