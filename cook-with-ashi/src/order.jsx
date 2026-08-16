import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon missing issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BADULLA_CENTER = { lat: 6.9934, lng: 81.0550 };
const MAX_DISTANCE_KM = 5;

// Helper to calculate distance
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

function LocationSelector({ location, setLocation }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const dist = getDistanceFromLatLonInKm(BADULLA_CENTER.lat, BADULLA_CENTER.lng, lat, lng);
      
      if (dist > MAX_DISTANCE_KM) {
        Swal.fire({
          title: "Outside Delivery Zone",
          text: "Sorry, we only deliver within 5km of Badulla town!",
          icon: "warning",
          confirmButtonText: "OK",
        });
      } else {
        setLocation({ lat, lng });
      }
    },
  });

  return location ? <Marker position={location} /> : null;
}

function MapUpdater({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 16);
    }
  }, [location, map]);
  return null;
}

export default function Order() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [phone, setPhone] = useState("");
  const [meal, setMeal] = useState("");
  const [count, setCount] = useState("1");
  const [menuList, setMenuList] = useState([]); // store menu from DB
  const [special, setSpecial] = useState("");
  const [location, setLocation] = useState(null);
  const navigate = useNavigate();
  
  const home = () => {
    navigate("/");
  };

  // Fetch menu from backend
  const fetchMenu = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/menu`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMenuList(data);
        if (data.length > 0 && !meal) setMeal(data[0].name);
      } else {
        console.error("API did not return an array:", data);
      }
    } catch (err) {
      console.error("Failed to fetch menu:", err);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const searchAddress = async () => {
    if (!address) {
      Swal.fire({ title: "No Address", text: "Please type an address first!", icon: "warning" });
      return;
    }
    try {
      Swal.fire({ title: "Searching...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Badulla, Sri Lanka")}`);
      const data = await res.json();
      Swal.close();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const dist = getDistanceFromLatLonInKm(BADULLA_CENTER.lat, BADULLA_CENTER.lng, lat, lng);
        if (dist > MAX_DISTANCE_KM) {
          Swal.fire({ title: "Outside Delivery Zone", text: "That address is more than 5km from Badulla town!", icon: "warning" });
        } else {
          setLocation({ lat, lng });
        }
      } else {
        Swal.fire({ title: "Not Found", text: "Could not find that exact address. Please adjust the pin manually on the map.", icon: "info" });
      }
    } catch (err) {
      Swal.close();
      console.error(err);
    }
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!location) {
      Swal.fire({
        title: "Location Required",
        text: "Please drop a pin on the map so our driver can find you!",
        icon: "warning",
      });
      return;
    }
    const orderData = { name, address, landmark, phone, meal, count, special, location };

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
        setLocation(null);
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
          <button type="button" onClick={searchAddress} style={{ marginBottom: "20px", backgroundColor: "#2196F3", color: "white", padding: "8px 12px", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%", fontWeight: "bold" }}>
            🔍 Search Address on Map
          </button>

          <label>Delivery Location (Map)</label>
          <p className="note">Tap on the map to drop a pin on your house, or click the button below to automatically find your location.</p>
          <button type="button" style={{ marginBottom: "10px", backgroundColor: "#ff9800", color: "white", padding: "8px 12px", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%", fontWeight: "bold" }} onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;
                  const dist = getDistanceFromLatLonInKm(BADULLA_CENTER.lat, BADULLA_CENTER.lng, lat, lng);
                  if (dist > MAX_DISTANCE_KM) {
                    Swal.fire({ title: "Outside Delivery Zone", text: "Your current location is more than 5km from Badulla town!", icon: "warning" });
                  } else {
                    setLocation({ lat, lng });
                  }
                },
                () => alert("Unable to retrieve your location")
              );
            } else {
              alert("Geolocation is not supported by this browser.");
            }
          }}>
            📍 Find My Location
          </button>
          
          <MapContainer center={BADULLA_CENTER} zoom={13} style={{ height: "300px", width: "100%", marginBottom: "10px", borderRadius: "10px", zIndex: 0 }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Circle center={BADULLA_CENTER} radius={5000} pathOptions={{ color: 'red', fillColor: '#f03', fillOpacity: 0.1 }} />
            <LocationSelector location={location} setLocation={setLocation} />
            <MapUpdater location={location} />
          </MapContainer>
          <button type="button" onClick={() => {
            if(location) Swal.fire({ title: "Location Confirmed!", icon: "success", timer: 1500, showConfirmButton: false });
            else Swal.fire({ title: "Pin Required", text: "Please drop a pin first!", icon: "warning" });
          }} style={{ marginBottom: "20px", backgroundColor: "#4CAF50", color: "white", padding: "8px 12px", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%", fontWeight: "bold" }}>
            ✅ Confirm Pin Location
          </button>


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
          </label><br/>
          <label>
            Quantity
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)} 
              min={1}/>
          </label>
          <br />
          <br />
          <label>
            Special Request 
            <textarea
              value={special}
              placeholder="Any special request?"
              onChange={(e) => setSpecial(e.target.value)}
            />
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