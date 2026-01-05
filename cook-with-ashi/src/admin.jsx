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
  const addtolist = () => {
    
  }
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/order"); // Make sure backend is running
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
                      {new Date(order.Time).getFullYear()}/
                      {new Date(order.Time).getMonth() + 1}/
                      {new Date(order.Time).getDate()}
                      <br />
                      {new Date(order.Time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td>{order.Name}</td>
                <td>{order.Phone}</td>
                <td>{order.Meal}</td>
                <td>{order.Address}</td>
                  <td>{order.Landmark}</td>
                  <td className="status">{order.Meal === "Vegetarian Plate" ? (<><button className="status1" >confirm</button><button className="status2">decline</button></>) :
                    (<><button className="status3" onClick={addtolist}>Add to list</button><button className="status2">decline</button></>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Admin;