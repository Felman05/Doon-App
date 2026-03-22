import { Link } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import CountUp from '../components/ui/CountUp';

export default function LandingPage() {
    return (
        <div className="pg on" id="pg-land">
            <Navbar />
            
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-tag"><div className="hero-tag-dot">↗</div>Smart Tourism Platform · CALABARZON</div>
                <h1 className="hero-h1">Discover<br /><em>where to go</em><br />in CALABARZON</h1>
                <p className="hero-sub">AI-powered recommendations, interactive maps, and smart trip planning — all five provinces in one platform.</p>
                <div className="hero-btns">
                    <Link className="hbp" to="/register">Start exploring →</Link>
                    <Link className="hbs" to="/signin">Sign in</Link>
                </div>
                <div className="scroll-hint">
                    <span>Scroll to explore</span>
                    <div className="scline"></div>
                </div>
            </section>

            {/* Stats Strip */}
            <div className="strip">
                <div className="strip-item"><div className="strip-num"><CountUp value={287} /></div><div className="strip-lbl">Destinations</div></div>
                <div className="strip-item"><div className="strip-num"><CountUp value={3841} /></div><div className="strip-lbl">Registered users</div></div>
                <div className="strip-item"><div className="strip-num"><CountUp value={5} /></div><div className="strip-lbl">Provinces covered</div></div>
                <div className="strip-item"><div className="strip-num"><CountUp value={18400} /></div><div className="strip-lbl">Monthly AI requests</div></div>
            </div>

            {/* Features Section */}
            <section className="sec" id="features">
                <div className="sec-tag">Platform Capabilities</div>
                <h2 className="sec-h2">Everything you need to <em>explore</em> CALABARZON</h2>
                <p className="sec-p">From AI-powered recommendations to real-time weather, we've built the complete toolkit for discovering your next adventure.</p>
                <div className="feat-grid">
                    <div className="feat-cell sr d1">
                        <div className="feat-ico">🗺️</div>
                        <h3 className="feat-h">Interactive Maps</h3>
                        <p className="feat-p">Explore destinations across 5 provinces with detailed location information and real-time updates.</p>
                        <div className="feat-tags">
                            <span className="feat-tag">Google Maps</span>
                            <span className="feat-tag">Real-time</span>
                        </div>
                    </div>
                    <div className="feat-cell sr d2">
                        <div className="feat-ico">🤖</div>
                        <h3 className="feat-h">AI Assistant</h3>
                        <p className="feat-p">Meet Doon, your intelligent travel companion powered by advanced machine learning.</p>
                        <div className="feat-tags">
                            <span className="feat-tag">Conversational</span>
                            <span className="feat-tag">24/7</span>
                        </div>
                    </div>
                    <div className="feat-cell sr d3">
                        <div className="feat-ico">🌤️</div>
                        <h3 className="feat-h">Live Weather</h3>
                        <p className="feat-p">Check real-time weather conditions for each province before you plan your trip.</p>
                        <div className="feat-tags">
                            <span className="feat-tag">Accurate</span>
                            <span className="feat-tag">Updated</span>
                        </div>
                    </div>
                    <div className="feat-cell sr d4 wide">
                        <div className="feat-ico">✨</div>
                        <h3 className="feat-h">Smart Recommendations</h3>
                        <p className="feat-p">Personalized suggestions based on your preferences, interests, and travel history powered by our recommendation engine.</p>
                        <div className="feat-tags">
                            <span className="feat-tag">Personalized</span>
                            <span className="feat-tag">Smart</span>
                            <span className="feat-tag">Adaptive</span>
                        </div>
                    </div>
                    <div className="feat-cell sr d4">
                        <div className="feat-big">5</div>
                        <div className="feat-big-lbl">Provinces to Explore</div>
                    </div>
                </div>
            </section>

            {/* Provinces Section */}
            <section className="prov-sec" id="provinces">
                <div className="prov-inner">
                    <div className="sec-tag">CALABARZON Region</div>
                    <h2 className="sec-h2" style={{color: 'white'}}>Five Provinces,<br/>Endless<br/><em>Possibilities</em></h2>
                    <div className="prov-grid">
                        <div className="prov-card sr">
                            <span className="prov-emo">🏖️</span>
                            <div className="prov-name">Batangas</div>
                            <div className="prov-n">The Beach Paradise</div>
                            <div className="prov-bar"></div>
                        </div>
                        <div className="prov-card sr d1">
                            <span className="prov-emo">🏞️</span>
                            <div className="prov-name">Laguna</div>
                            <div className="prov-n">Mountains & Lakes</div>
                            <div className="prov-bar"></div>
                        </div>
                        <div className="prov-card sr d2">
                            <span className="prov-emo">🏰</span>
                            <div className="prov-name">Cavite</div>
                            <div className="prov-n">Historical Heritage</div>
                            <div className="prov-bar"></div>
                        </div>
                        <div className="prov-card sr d3">
                            <span className="prov-emo">🗻</span>
                            <div className="prov-name">Rizal</div>
                            <div className="prov-n">Highland Adventures</div>
                            <div className="prov-bar"></div>
                        </div>
                        <div className="prov-card sr d4">
                            <span className="prov-emo">🌾</span>
                            <div className="prov-name">Quezon</div>
                            <div className="prov-n">Nature & Culture</div>
                            <div className="prov-bar"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="sec" id="how">
                <div className="sec-tag">Getting Started</div>
                <h2 className="sec-h2">How Doon <em>Works</em></h2>
                <p className="sec-p">Your journey to discovering CALABARZON in four simple steps.</p>
                <div className="steps-row">
                    <div className="step-cell sr d1">
                        <div className="step-n">1</div>
                        <h3 className="step-h">Sign Up</h3>
                        <p className="step-p">Create your profile and choose your role: tourist, local provider, or admin.</p>
                    </div>
                    <div className="step-cell sr d2">
                        <div className="step-n">2</div>
                        <h3 className="step-h">Explore</h3>
                        <p className="step-p">Browse destinations, check weather, and chat with Doon for personalized recommendations.</p>
                    </div>
                    <div className="step-cell sr d3">
                        <div className="step-n">3</div>
                        <h3 className="step-h">Plan</h3>
                        <p className="step-p">Build your itinerary, add to packing list, and save your favorite destinations.</p>
                    </div>
                    <div className="step-cell sr d4">
                        <div className="step-n">4</div>
                        <h3 className="step-h">Connect</h3>
                        <p className="step-p">Share experiences, review destinations, and connect with other travelers.</p>
                    </div>
                </div>
            </section>

            {/* User Roles Section */}
            <section className="sec" id="users">
                <div className="sec-tag">Choose Your Role</div>
                <h2 className="sec-h2">Everyone wins on <em>Doon</em></h2>
                <div className="roles-grid">
                    <div className="role-card sr d1">
                        <div className="role-ico">🧳</div>
                        <h3 className="role-title">Tourist</h3>
                        <p className="role-desc">Explore destinations, get AI recommendations, and plan your perfect CALABARZON adventure.</p>
                        <ul className="role-list">
                            <li>Browse 287+ destinations</li>
                            <li>AI-powered suggestions</li>
                            <li>Interactive weather updates</li>
                            <li>Trip planning tools</li>
                        </ul>
                        <Link to="/register" className="role-btn">Explore as Tourist</Link>
                    </div>
                    <div className="role-card sr d2 dark">
                        <div className="role-ico">🏢</div>
                        <h3 className="role-title">Provider</h3>
                        <p className="role-desc">Showcase your business, manage listings, and grow your customer base through Doon.</p>
                        <ul className="role-list">
                            <li>Create business profile</li>
                            <li>Manage listings</li>
                            <li>View analytics</li>
                            <li>Get customer reviews</li>
                        </ul>
                        <Link to="/register" className="role-btn">Join as Provider</Link>
                    </div>
                    <div className="role-card sr d3">
                        <div className="role-ico">👨‍💼</div>
                        <h3 className="role-title">Admin</h3>
                        <p className="role-desc">Manage platform content, moderate community, and ensure quality across CALABARZON.</p>
                        <ul className="role-list">
                            <li>Content moderation</li>
                            <li>User management</li>
                            <li>Analytics dashboard</li>
                            <li>Approval workflows</li>
                        </ul>
                        <Link to="/register" className="role-btn">Manage as Admin</Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
