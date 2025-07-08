import Image from "next/image";
import ftrimg1 from "../assets/urdesktop/urlogodesktop.webp";
import ftrimg2 from "../assets/urdesktop/irlogodesktop.webp";
import ftrimg3 from "../assets/urdesktop/logodesktop.webp";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
export default function DesktopFooter() {
  return (
    <footer className="text-white pt-5 pb-5 px-3 px-xl-4" style={{ backgroundColor: "var(--amenitiesbg)" }}>
      <div className="container">
        <div className="px-3">
          <div className="row gx-5 d-flex  justify-content-between align-items-start">
            {/* Left Column */}
            <div className="col-md-5 col-lg-4 d-flex flex-column flex-xl-nowrap flex-wrap gap-4">
              
                <Image src={ftrimg1} alt="urban ranch logo" className="img-fluid" />
              
              <div className="d-flex align-items-center">
              <Image src={ftrimg3} alt="IRA logo" className="img-fluid" />
                <Image src={ftrimg2} alt="Iron horse logo" className="img-fluid" />
                </div>
              <div className="d-flex flex-column gap-3" style={{ fontSize: 14, color: "#BDBDBD" }}>
                <ul className="mb-2 list-unstyled" >
                  <li>
                    <FaMapMarkerAlt className="me-2" />
                    <span>
                      4-49/2, Besides Anvaya Conventions Road, Financial District,
                      Vattinagulapally, Hyderabad - 500 032, Telangana
                    </span>
                  </li>
                </ul>

                <div className="d-flex flex-column flex-sm-row justify-content-between gap-2">
                  <p className="mb-0 d-flex align-items-center">
                    <FaPhoneAlt className="me-2" /> +91 8001 345 345
                  </p>
                  <p className="mb-0 d-flex align-items-center">
                    <FaEnvelope className="me-2" /> info@irarealty.in
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="col-md-7 col-lg-8 mt-5 mt-md-0">
              <div className="d-flex flex-column mt-3 gap-5 gap-xxl-4">
                <div className="d-flex justify-content-between flex-wrap gap-4">
                  {/* Quick Links */}
                  <div>
                    <h5 style={{ fontSize: 20 }}>Quick Links</h5>
                    <ul className="list-unstyled mt-4 d-flex flex-column gap-3 fw-light" style={{ fontSize: 14, color: "#BDBDBD" }}>
                      <li>
                        <a href="#home" className="text-decoration-none" style={{ color: "#BDBDBD" }}>Home</a>
                      </li>
                      <li>
                        <a href="#floor-plans" className="text-decoration-none" style={{ color: "#BDBDBD" }}>Floor Plans</a>
                      </li>
                      <li>
                        <a href="#contact-us" className="text-decoration-none" style={{ color: "#BDBDBD" }}>Contact Us</a>
                      </li>
                      <li>
                        <a href="https://irarealty.in/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-decoration-none" style={{ color: "#BDBDBD" }}>
                          Privacy Policy
                        </a>
                      </li>
                    </ul>
                  </div>


                  {/* Social Media */}
                  <div>
                    <h5 style={{ fontSize: 20 }}>Social Media</h5>
                    <ul className="list-unstyled mt-4 d-flex flex-column gap-3  fw-light" style={{ fontSize: 14, color: "#BDBDBD" }}>
                      <li>Facebook</li>
                      <li>Whatsapp</li>
                    </ul>
                  </div>

                  {/* Sales Expert Contact */}
                  <div>
                    <h5 style={{ fontSize: 20 }}>Talk to our sales expert</h5>
                    <a href="#contact-us" className="text-white text-decoration-none">
                    <button
                      className="btn text-white mt-4"
                      style={{
                        width: "300px",
                        height: "60px",
                        borderRadius: "10px",
                        backgroundColor: "var(--iconbg)",
                        border: "none",
                      }}
                    >
                      Click Here
                    </button>
                    </a>
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="fw-light mt-2" style={{ fontSize: 14, color: "#BDBDBD" }}>
                  This is purely a conceptual presentation and not a legal offering.
                  The promoters reserve the right to make changes in elevation,
                  specifications, and plans as deemed fit.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="d-flex justify-content-end pt-4" style={{ fontSize: 14, color: "#BDBDBD" }}>
            <p className="mb-0">©2025 IRAREALTY</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
