import { Link } from 'react-router-dom';

function Header() {
    const welcomeText = 'WELCOME...!';
    return (
        <header>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem" }}>
            <img id="icon" src="/favicon.ico" alt="cook with Ashi icon" />
            <Link to="/admin-login" target="_blank" rel="noopener noreferrer"><button id='admin' >Admin</button></Link></div>
            <h2 className="welcome">
                {Array.from(welcomeText).map((ch, i) => (
                    <span key={i} className="letter" style={{ ['--i']: i }}>{ch}</span>
                ))}
            </h2>
            <h1>Cook with Ashi</h1>
            <h2 id="subtitle">Enjoy your homemade, healthy lunch delivered daily in Badulla.</h2>
            <span id="navbar">
                {/* <Link to="/">Home</Link> */}
                <Link to="/about">About</Link>
                <Link to="/order" target="_blank" rel="noopener noreferrer">Order</Link>
                <Link to="/contact">Contact</Link>
            </span>
            
        </header>
    );
}
export default Header;
