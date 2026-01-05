import "./admin.css";
import { Link } from 'react-router-dom';
import { useState } from "react";


function post() { 
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // first selected file
  };

    return (<>
        <nav><Link to="">list to deliver</Link><Link to="/admin">Orders</Link></nav>
        <div className="box1">
        {image && (
        <img
            src={URL.createObjectURL(image)}
            alt="preview"
            width="200"
        />
        )}<br></br>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
            />
        </div></>
        
  );



}
export default post