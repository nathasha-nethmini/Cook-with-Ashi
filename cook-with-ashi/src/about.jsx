import "./about.css";
import { Link } from "react-router-dom";
import img3 from "./assets/3.png";
import img4 from "./assets/4.png";
import img5 from "./assets/4.png";
import img6 from "./assets/3.png";
import img7 from "./assets/4.png";
import img8 from "./assets/4.png";


function About() {
  return (
    <div className="about-page">

            <h1>About Us</h1>
      <hr />
            <div className="rotating-badge" aria-hidden="true">
          <svg className="rotating-text" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <path id="circlePath" d="M100,100 m0,-80 a80,80 0 1,1 0,160 a80,80 0 1,1 0,-160" />
            </defs>
            <text>
              <textPath href="#circlePath" startOffset="50%" textAnchor="middle">COOK WITH ASHI • COOK WITH ASHI • COOK WITH ASHI • </textPath>
            </text>
          </svg>
          <img src="favicon.ico" className="center-icon" alt="Cook With Ashi icon" />
      </div>
      
          <nav id="navbar">
                <Link to="/">Home</Link>
                {/* <Link to="/about">About</Link> */}
                <Link to="/order" target='_blank'>Order</Link>
                <Link to="/contact">Contact</Link>
          </nav>
          <div className="about-content">
            <div className="about-media">
              <img src="/2026.jpeg" id="img-2026" className="about-img" alt="About" />
            </div>
            <div className="about-copy">
                    <p className="about-text">At <strong>COOK WITH ASHI</strong> we are passionate about bringing home-made, healthy meals to your table. Every dish is prepared with love, care, and fresh ingredients, creating flavors that nourish both body and soul. We strive to make every meal a delightful, wholesome experience for you and your loved ones.</p>
                </div>

            </div>
            <div className="about">
              <h2>How It Works</h2>
              <p>
                Once you submit your order, we will notify you within <strong>10 minutes</strong> about the confirmation of your order.
              </p>
              <p>
                If you have any questions or special instructions, you can <strong>WhatsApp us</strong> at the number provided.
              </p>
              <p>
                All our communication is primarily through <strong>WhatsApp</strong>, so please make sure to enter a <strong>valid phone number</strong>.
              </p>
              <p>
                Once your order reaches your place, you will also receive a <strong>WhatsApp call</strong>.
        </p>
        <h4><b>Free delivery – Badulla area.</b></h4>
            </div>

      <div className="box">
        
          <div className="box1"><img src={img3} alt="image" /></div>

            <div className="box2"><img src={img4} alt="image" /></div>
            <div className="box3"><img src={img5} alt="image" /></div>
            <div className="box4"><img src={img6} alt="image" /></div>
            <div className="box5"><img src={img7} alt="image" /></div>
        <div className="box6"><img src={img8} alt="image" /></div>
      </div>
        </div>
    );
}
export default About;

