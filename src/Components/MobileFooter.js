import Image from "next/image";
import ftrimg1 from "../assets/footer/ftrimg1.webp";
import ftrimg2 from "../assets/footer/ftrimg2.webp";
import ftrimg3 from "../assets/footer/ftrimg3.webp";

export default function MobileFooter() {
  return (
    <footer className=" text-white pt-5 px-3 d-flex flex-column align-items-center gap-4" style={{backgroundColor:"var(--amenitiesbg)"}}>
      {/* Top Section with Images and Contact */}
      <div className="d-flex w-100 justify-content-center align-items-start flex-nowrap gap-4">
        {/* Logos Column */}
        <div className="d-flex flex-column align-items-center justify-content-between gap-5" style={{ flex: 1}}>
          <Image src={ftrimg1} alt="Urban Ranch logo" className="img-fluid" />
          <Image src={ftrimg2} alt="Iron Horse logo" className="img-fluid" />
          <Image src={ftrimg3} alt="IRA logo" className="img-fluid" />
        </div>

        {/* Divider Line */}
        <div
    className="d-block "
    style={{
      width: "1px",
      backgroundColor: "#ffffff50",
      height: "auto",
      alignSelf: "stretch",
    }}
  />

        {/* Contact Info Column */}
        <div className="d-flex flex-column gap-3" style={{ flex: 1, fontSize: "0.8rem" }}>
          <div>
            <h6 className="mb-1" style={{ fontSize: "0.9rem" }}>Talk to our sales expert</h6>
            <button
              className="btn btn-sm text-white"
              style={{ backgroundColor: "var(--icondesc)", borderRadius: "5px", fontSize: "0.75rem", width: "120px", height: "30px" }}
            >
              Click Here
            </button>
          </div>

          <div>
            <p className="mb-1 fw-bold" style={{ fontSize: "0.8rem" }}>Address:</p>
            <p className="mb-0">
              4-49/2, Besides Anvaya Conventions Road,<br />
              Financial District, Vattinagulapally,<br />
              Hyderabad - 500 032, Telangana
            </p>
          </div>

          <div>
            <p className="mb-1">Phone: +91 9121 777 777</p>
            <p>Email: info@irarealty.in</p>
          </div>

          <div>
            <h6 className="mb-1" style={{ fontSize: "0.9rem" }}>Social Media</h6>
            <div className="d-flex gap-3">
              <a href="#" className="text-white text-decoration-none small">Facebook</a>
              <a href="#" className="text-white text-decoration-none small">Whatsapp</a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="w-100 d-flex flex-column align-items-center text-center gap-2" style={{ fontSize: "0.75rem" }}>
        <ul className="list-unstyled d-flex flex-wrap justify-content-center gap-3 mb-2">
          <li>Home</li>
          <li>Floor Plans</li>
          <li>Contact Us</li>
          <li>Privacy Policy</li>
        </ul>

        <p className="px-3 mb-1" style={{ maxWidth: "700px", lineHeight: "1.4" }}>
          This is purely a conceptual presentation and not a legal offering. The promoters reserve the right to make
          changes in elevation, specifications, and plans as deemed fit.
        </p>

        <p className="mb-0">©2025 IRAREALTY</p>
      </div>
    </footer>
  );
}
