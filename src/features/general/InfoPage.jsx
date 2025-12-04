import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { OrigenSection, ExperienciaSection } from './components/InfoSections';
import './Landing.css';
import AmaraLogo from "../../assets/AmaraLogo.png";

const InfoPage = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [usuarioImg, setUsuarioImg] = useState(null);

    const navigate = useNavigate();
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    // === Efecto de scroll para navbar ===
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [scrolled]);

    // === Cargar imagen del usuario ===
    useEffect(() => {
        if (!usuario?.correo) return;
        fetch(`https://amarantaapi.somee.com/api/Usuarios/ObtenerPorCorreo?correo=${usuario.correo}`)
            .then((response) => {
                if (!response.ok) throw new Error("No se encontró usuario");
                return response.json();
            })
            .then((data) => setUsuarioImg(data.imagenPerfil))
            .catch((error) => console.error("Error al obtener imagen:", error));
    }, [usuario]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "¿Cerrar sesión?",
            text: "¿Estás seguro de que deseas salir?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#b45309",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar",
            background: "#fff8e7",
        });

        if (result.isConfirmed) {
            localStorage.removeItem("usuario");
            navigate("/");
            window.location.reload();
        }
    };

    const renderUserOptions = () => {
        if (!usuario) {
            return (
                <li>
                    <a onClick={() => navigate("/login")} className="link" style={{ cursor: "pointer" }}>
                        Ingresar
                    </a>
                </li>
            );
        }

        if (usuario.rol === "Admin") {
            return (
                <>
                    <li>
                        <a onClick={() => navigate("/admin/dashboard")} className="link" style={{ cursor: "pointer" }}>
                            Admin
                        </a>
                    </li>
                    <li>
                        <a onClick={handleLogout} className="link" style={{ cursor: "pointer" }}>
                            Cerrar sesión
                        </a>
                    </li>
                </>
            );
        }
        return (
            <>
                <li className="perfil-opciones">
                    <a onClick={() => navigate("/perfil")} className="link" style={{ cursor: "pointer" }}>
                        <div className="foto-container-nav">
                            <div className="foto-wrapper-nav">
                                <img
                                    src={usuarioImg || "https://i.pinimg.com/736x/5a/1e/fd/5a1efd27ee4f553c1c3ec13f9edf62ee.jpg"}
                                    alt="Perfil"
                                    className="foto-usuario-nav"
                                />
                            </div>
                        </div>
                    </a>
                </li>
                <li>
                    <a onClick={handleLogout} className="link" style={{ cursor: "pointer" }}>
                        Cerrar sesión
                    </a>
                </li>
            </>
        );
    };

    return (
        <div className="landing-page">
            {/* ===== Navbar ===== */}
            <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
                <div className="logos">
                    <Link to="/">
                        <img src={AmaraLogo} alt="Amaranta Logo" className="img-logo" />
                    </Link>
                    <div className="nav-brand">
                        <h1 className="logo">AMARANTA</h1>
                        <span className="logo-subtitle">Cigars</span>
                    </div>
                </div>

                <div className="hamburger-menu" onClick={toggleMobileMenu}>
                    <div className={`bar ${mobileMenuOpen ? "open" : ""}`}></div>
                    <div className={`bar ${mobileMenuOpen ? "open" : ""}`}></div>
                    <div className={`bar ${mobileMenuOpen ? "open" : ""}`}></div>
                </div>

                <nav className={`nav-menu ${mobileMenuOpen ? "active" : ""}`}>
                    <ul className="nav-links">
                        <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>Catálogo</Link></li>
                        <li><Link to="/nosotros" onClick={() => setMobileMenuOpen(false)}>Origen & Experiencia</Link></li>
                        {usuario && usuario.rol !== "Admin" && (
                            <li>
                                <Link
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    style={{ cursor: "pointer" }}
                                >
                                    Mis Pedidos
                                </Link>
                            </li>
                        )}
                        {renderUserOptions()}
                    </ul>
                </nav>
            </header>

            <div style={{ paddingTop: '0' }}>
                <OrigenSection />
                <ExperienciaSection />
            </div>

            {/* ===== Footer ===== */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-column brand-column">
                            <div className="footer-brand">
                                <h2>AMARANTA</h2>
                                <span>Cigars</span>
                            </div>
                            <p className="footer-desc">
                                Tradición y excelencia en cada cigarro. Llevando el mejor tabaco colombiano al mundo.
                            </p>
                        </div>

                        <div className="footer-column">
                            <h3>Enlaces Rápidos</h3>
                            <ul className="footer-links">
                                <li><Link to="/">Inicio</Link></li>
                                <li><Link to="/">Catálogo</Link></li>
                                <li><Link to="/nosotros">Origen & Experiencia</Link></li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h3>Contacto</h3>
                            <ul className="footer-contact">
                                <li><FaPhone /> 321 0000000</li>
                                <li><FaEnvelope /> info@amarantacigars.com</li>
                                <li><FaMapMarkerAlt /> Colombia</li>
                            </ul>
                        </div>

                        <div className="footer-column">
                            <h3>Síguenos</h3>
                            <div className="footer-icons">
                                <a href="https://www.facebook.com/share/17KYrWg3x8/" target="blank">
                                    <img src="https://i.pinimg.com/736x/07/52/f5/0752f5634bcf549014cb18a9cf6b4481.jpg" alt="Facebook" />
                                </a>
                                <a href="https://www.instagram.com/amarantacigars" target="blank">
                                    <img src="https://i.pinimg.com/564x/25/38/de/2538ded09c774ccd821d768b92f24e5a.jpg" alt="Instagram" />
                                </a>
                                <a href="https://w.app/yyivp3" target="blank">
                                    <img src="https://i.pinimg.com/1200x/fa/6b/2c/fa6b2c3835597812db7407c06f4d6f3f.jpg" alt="WhatsApp" />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2025 Amaranta Cigars | Todos los derechos reservados</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default InfoPage;
