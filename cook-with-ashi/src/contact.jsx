import './contact.css';
import { Link } from "react-router-dom";
export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for contacting us! We will get back to you soon.");
  };

  return (
    <>
    <span id="nav">
        <ul>
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              {/* <Link to="/order" target='blank'>Order</Link>
          <Link to="/contact">Contact</Link> */}
        </ul>
      </span>
    <div className="contact">
      <div className="contact-box">
        <h2>Contact Us</h2>
        <p>
          Have a question or need help with an order?  
          Feel free to reach out to us anytime.
        </p>

        {/* <form onSubmit={handleSubmit}>
          <label>
            Name
            <input type="text" placeholder="Your Name" required />
          </label>

          <label>
            whatsapp Number
            <input type="tel" placeholder="07X XXX XXXX" required />
          </label>

          <label>
            Message
            <textarea placeholder="Type your message here..." required />
          </label>

          <button type="submit">Send Message</button>
        </form>
      </div>

      <div className="contact-info"> */}
        <h3>Get in Touch</h3>
        <p><strong>📍 Location:</strong> Badulla Town</p>
        <p><strong>📞 Phone:</strong> 07X XXX XXXX</p>
        <p><strong>🕒 Hours:</strong> 10:00 AM – 2:00 PM</p>
        <p><strong>🍱 Service:</strong> Lunch only</p>
      </div>
      </div>

    </>
  );
}
