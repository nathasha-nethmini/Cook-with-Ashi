import { useEffect, useState } from "react";
import "./admin.css"
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

function Admin() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const logout = () => {
    navigate("/");
  }


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders"); // Make sure backend is running
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();
        
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
      // Poll every 10 seconds
    const interval = setInterval(fetchOrders, 10000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);
  
  if (loading) return <p>Loading orders...</p>;

  return (
    
    <div style={{ padding: "20px" }}>
      <nav><Link to="">list to deliver</Link><Link to="/post">posts</Link></nav>
    <button id="logout" onClick={logout}>logout</button>
    
      <h1>Admin Orders</h1>


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
              {orders.map((order, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
              <td>
                {(() => {
                  const orderDate = new Date(order.date); // <-- use `date` field
                  return `${orderDate.getFullYear()}/${orderDate.getMonth() + 1}/${orderDate.getDate()} 
                          ${orderDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                })()}
              </td>

                <td>{order.name}</td>
                <td>{order.phone}</td>
                <td>{order.meal}</td>
                <td>{order.address}</td>
                  <td>{order.landmark}</td>
                  <td className="status">{order.meal === "Vegetarian Plate" ? (<><button className="status1" >confirm</button><button className="status2">decline</button></>) :
                    (<><button className="status3" >Add to list</button><button className="status2">decline</button></>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Admin;