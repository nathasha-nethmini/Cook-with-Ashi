import { Link } from 'react-router-dom';

function Header() {
    const welcomeText = 'WELCOME...!';
    return (
        <header>
            <Link to="/admin-login" target='blank'><button id='admin'>admin</button></Link>
            <h2 className="welcome">
                {Array.from(welcomeText).map((ch, i) => (
                    <span key={i} className="letter" style={{ ['--i']: i }}>{ch}</span>
                ))}
            </h2>
            <h1>Cook with Ashi</h1>
            <h2 id="subtitle">Enjoy your homemade, healthy lunch delivered daily in Badulla.</h2>
            <span id="navbar">
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/order" target='blank'>Order</Link>
                <Link to="/contact">Contact</Link>
            </span>
            
        </header>
    );
}
export default Header;
