import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./admin.css";

function Admin() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- LOGOUT ---------- */
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  /* ---------- UPDATE ORDER STATUS ---------- */
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${id}/status`,
        {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
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
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (res.status === 401) {
          // Token expired or invalid
          logout();
          return;
        }
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || data.msg || "Failed to fetch orders");
        }

        if (!Array.isArray(data)) {
          console.error("Expected array from API, but got:", data);
          setOrders([]);
          return;
        }

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

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");

  if (loading) return <p>Loading orders...</p>;

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/update-credentials`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setUpdateMsg("Credentials updated! Please login again.");
        setTimeout(logout, 2000);
      } else {
        setUpdateMsg(data.error || "Update failed");
      }
    } catch (err) {
      setUpdateMsg("Error updating credentials");
    }
  };

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

      <div style={{ marginTop: "20px", marginBottom: "20px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "400px" }}>
        <h3>Update Admin Credentials</h3>
        <form onSubmit={handleUpdateCredentials}>
          <input type="text" placeholder="New Username" required value={newUsername} onChange={(e) => setNewUsername(e.target.value)} style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px' }} />
          <input type="password" placeholder="New Password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px' }} />
          <button type="submit">Update & Relogin</button>
        </form>
        {updateMsg && <p style={{ color: 'blue', marginTop: '10px' }}>{updateMsg}</p>}
      </div>

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
                <th>count</th>
                <th>special</th>
              <th>Address</th>
              <th>Landmark</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => {
              const date = new Date(order.date);
              const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`;

              // WhatsApp links
              const phoneNumber = "94" + order.phone.replace(/[^0-9]/g, "");
              const whatsappConfirm = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                `Hello ${order.name}, your order for ${order.meal} has been confirmed. We will deliver it to ${order.address} around 2-3 p.m. You will receive a call when the order arrives. If you have any special instructions or questions, feel free to reply to this message.`
              )}`;
              const whatsappDecline = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                `Dear ${order.name}, we’re sorry, but we cannot send your order (${order.meal}: ${order.orderName}) at this time. If you have any questions or special requests, please feel free to reply to this message. We apologize for the inconvenience.`
              )}`;

              // Row color based on status
              const rowClass =
                order.status === "Confirmed"
                  ? "confirmed-row"
                  : order.status === "Declined"
                  ? "declined-row"
                  : "pending-row";

              return (
                <tr key={order._id} className={rowClass}>
                  <td>{index + 1}</td>
                  <td>{formattedDate}</td>
                  <td>{order.name}</td>
                  <td>{order.phone}</td>
                  <td>{order.meal}</td>
                  <td>{order.count}</td>
                  <td>{order.special}</td>
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
