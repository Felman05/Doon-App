import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav id="nav" className="sc">
            <Link className="nlogo" to="/">doon<b>.</b></Link>
            <div className="nctr">
                <a className="nlnk" href="#features">Features</a>
                <a className="nlnk" href="#provinces">Provinces</a>
                <a className="nlnk" href="#how">How it works</a>
                <a className="nlnk" href="#users">For you</a>
            </div>
            <div className="nrt">
                <Link className="nbtn-o" to="/signin">Sign in</Link>
                <Link className="nbtn-s" to="/register">Get started →</Link>
            </div>
        </nav>
    );
}
