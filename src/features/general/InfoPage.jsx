import React from 'react';
import { OrigenSection, ExperienciaSection } from './components/InfoSections';
import './Landing.css'; // Reuse styles
import { Link } from 'react-router-dom';
import AmaraLogo from "../../assets/AmaraLogo.png";

const InfoPage = () => {
    return (
        <div className="landing-page">
            {/* Navbar simplificado para volver */}
            <header className="navbar scrolled">
                <div className="logos">
                    <Link to="/">
                        <img src={AmaraLogo} alt="Amaranta Logo" className="img-logo" />
                    </Link>
                    <div className="nav-brand">
                        <h1 className="logo">AMARANTA</h1>
                        <span className="logo-subtitle">Cigars</span>
                    </div>
                </div>
                <nav>
                    <ul className="nav-links">
                        <li><Link to="/">Volver al Inicio</Link></li>
                    </ul>
                </nav>
            </header>

            <div style={{ paddingTop: '100px' }}>
                <OrigenSection />
                <ExperienciaSection />
            </div>

            <footer className="footer">
                <div className="container">
                    <div className="footer-bottom">
                        <p>© 2025 Amaranta Cigars | Todos los derechos reservados</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default InfoPage;
