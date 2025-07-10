"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import mlogo from "../assets/Images/mobile/Group801.webp";
import dlogo from "../assets/Images/desktop/Group801.webp";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const handleLinkClick = (section) => {
    setActiveLink(section);
    closeMenu();
  };

  return (
    <header className="py-3 my-5 px-3 px-lg-5 Navbar position-fixed">
      {/* Mobile View */}
      <div className="d-lg-none position-relative">
        {/* Centered Logo */}
        <div className="text-center">
          <Image
            src={mlogo}
            alt="logo"
            
            priority
            className="img-fluid mx-auto mt-5"
          />
        </div>
        {/* Hamburger top-right */}
        <div className="position-absolute hammenu">
          {!isOpen && (
            <button className="btn text-white fs-3" onClick={() => setIsOpen(true)}>
              <RxHamburgerMenu />
            </button>
          )}
        </div>
      </div>

      {/* Desktop View */}
      <div className="d-none d-lg-flex justify-content-start align-items-center Navbar1">
        <Image src={dlogo} alt="logo" className="img-fluid" priority />
        <nav className="d-flex gap-5">
          {["#home", "#floor-plans", "#amenities", "#contact-us"].map((section) => (
            <a
              key={section}
              href={section}
              className={`nav-link fw-medium position-relative ${
                activeLink === section ? "text-warning translate-up" : "text-light"
              }`}
              onClick={() => handleLinkClick(section)}
            >
              {section
                .replace("#", "")
                .replace("-", " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}

              {/* Dot for active link */}
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
          ))}
        </nav>
      </div>

      {/* Mobile Overlay Menu */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-white p-4"
          style={{ zIndex: 1050 }}
          onClick={closeMenu}
        >
          {/* Close Button */}
          <div className="position-absolute top-0 end-0 mt-3 me-3">
            <button className="btn fs-3 text-dark" onClick={closeMenu}>
              <IoMdClose />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="d-flex flex-column gap-4 mt-5 pt-5" onClick={(e) => e.stopPropagation()}>
            {["#home", "#floor-plans", "#amenities", "#contact-us"].map((section) => (
              <a
                key={section}
                href={section}
                className={`nav-link fs-5 ${
                  activeLink === section ? "text-warning" : "text-dark"
                }`}
                onClick={() => handleLinkClick(section)}
              >
                {section.replace("#", "").replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Style for translate-up animation */}
      <style jsx>{`
        .translate-up {
          transform: translateY(-10px);
          transition: transform 0.2s ease;
        }
      `}</style>
    </header>
  );
}

