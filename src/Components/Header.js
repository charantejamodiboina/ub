"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import mlogo from "../assets/UrImages/mobile/Group801.webp";
import dlogo from "../assets/UrImages/desktop/Group801.webp";
import dlogoScrolled from "../assets/UrImages/desktop/GroupM801.webp";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkSize = () => {
      setIsDesktop(window.innerWidth > 991);
    };

    checkSize();
    window.addEventListener("resize", checkSize);

    const handleScroll = () => {
      if (window.innerWidth > 991) {
        setIsScrolled(window.scrollY > 5);
      } else {
        setIsScrolled(false); // no scroll effect on mobile
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkSize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const handleLinkClick = (section) => {
    setActiveLink(section);
    closeMenu();
  };

  return (
    <header
      className="py-3 px-3 px-lg-5 position-fixed w-100 transition-all"
      style={{
        zIndex: 999,
        backgroundColor: isScrolled ? "#fff" : "transparent",
        boxShadow: isScrolled ? "0 2px 6px rgba(0,0,0,0.1)" : "none",
        top: 0,
        left: 0,
      }}
    >
      {/* Mobile View */}
      <div className="d-lg-none d-flex justify-content-end align-items-center position-relative">
        {/* Logo (Relative) */}
        {/* <div className="position-relative" style={{ zIndex: 10 }}>
          <Image
            src={mlogo}
            alt="Mobile Logo"
            priority
            className="img-fluid"
            style={{ height: 40 }}
          />
        </div> */}

        {/* Hamburger Menu */}
        {!isOpen && (
          <button
            className="btn fs-3 border-0 bg-transparent p-0"
            onClick={() => setIsOpen(true)}
            style={{ zIndex: 10 }}
          >
            <RxHamburgerMenu className="text-white" />
          </button>
        )}
      </div>

      {/* Desktop View */}
      <div className="container">
        <div className="d-none d-lg-flex justify-content-between align-items-center Navbar1">
          <Image
            src={isScrolled ? dlogoScrolled : dlogo}
            alt="logo"
            className="img-fluid"
            priority
          />
          <nav className="d-flex gap-5 ms-4">
            {["#home", "#floor-plans", "#amenities", "#contact-us"].map(
              (section) => (
                <a
                  key={section}
                  href={section}
                  className={`nav-link fw-medium position-relative ${
                    activeLink === section
                      ? "text-warning translate-up"
                      : isScrolled
                      ? "text-dark"
                      : "text-light"
                  }`}
                  onClick={() => handleLinkClick(section)}
                >
                  {section
                    .replace("#", "")
                    .replace("-", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                  {activeLink === section && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: -25,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "1.2rem",
                        marginTop: "0.2rem",
                      }}
                    >
                      •
                    </span>
                  )}
                </a>
              )
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Overlay Menu */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-white p-4"
          style={{ zIndex: 1050 }}
          onClick={closeMenu}
        >
          <div className="position-absolute top-0 end-0 mt-3 me-3">
            <button className="btn fs-3 text-dark" onClick={closeMenu}>
              <IoMdClose />
            </button>
          </div>
          <div
            className="d-flex flex-column gap-4 mt-5 pt-5"
            onClick={(e) => e.stopPropagation()}
          >
            {["#home", "#floor-plans", "#amenities", "#contact-us"].map(
              (section) => (
                <a
                  key={section}
                  href={section}
                  className={`nav-link fs-5 ${
                    activeLink === section ? "text-warning" : "text-dark"
                  }`}
                  onClick={() => handleLinkClick(section)}
                >
                  {section
                    .replace("#", "")
                    .replace("-", " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </a>
              )
            )}
          </div>
        </div>
      )}

      {/* Animate Active Link */}
      <style jsx>{`
        .translate-up {
          transform: translateY(-10px);
          transition: transform 0.2s ease;
        }
      `}</style>
    </header>
  );
}
