import Image from "next/image";
// import ftrimg1 from "../assets/urmobile/urflogomobile.webp";
// import ftrimg2 from "../assets/urmobile/ihlogomobile.webp";
// import ftrimg3 from "../assets/urmobile/logofmobile.webp";

export default function MobileFooter() {
  return (
    <footer
      className="text-white pt-4 pb-0 d-flex flex-column align-items-center gap-3"
      style={{ backgroundColor: "var(--amenitiesbg)" }}
    >
      <div className="container">
        {/* Top Section */}
        <div className="px-3">
          <div className="row">
            {/* Logos Column */}
            <div className="col-5 col-md-6 d-flex flex-column align-items-center justify-content-between ">
              <div className="d-flex flex-column align-items-start justify-content-between  gap-5 h-100">
                <Image src={ftrimg1} alt="Urban Ranch logo" className="img-fluid" />
                <div className="d-flex flex-column mt-4">
                  <Image src={ftrimg3} alt="IRA logo" className="img-fluid ps-1" />
                  <Image src={ftrimg2} alt="Iron Horse logo" className="img-fluid" />
                </div>
              </div>
            </div>

            {/* Contact Info Column */}
            <div className="col-7 col-md-6 ps-3 d-flex flex-column gap-2 ftrcontact" >
              <div>
                <h6 className=" ftrbold">
                  Talk to our sales expert
                </h6>
                <a href="#contact-us" className="text-white text-decoration-none">
                <button
                  className="btn btn-sm text-white"
                  style={{
                    backgroundColor: "var(--icondesc)",
                    borderRadius: "5px",
                    fontSize: "0.75rem",
                    width: "138px",
                    height: "28px",
                  }}
                >
                  Click Here
                </button>
                </a>
              </div>

              <div>
                <p className="mb-0 ftrsemibold">Address:</p>
                <p className="mb-0 ftrnormal">
                  4-49/2, Besides Anvaya Conventions Road,<br />
                  Financial District, Vattinagulapally,
                  Hyderabad - <br />500 032, Telangana
                </p>
              </div>


              <p className="mb-0 ftrsemibold">Phone: +91 8001 345 345</p>
              <p className="mb-0 ftrsemibold">Email: info@irarealty.in</p>


              <div>
                <h6 className=" ftrsemibold" >Social Media : </h6>
                <div className="d-flex gap-1">
                  <a href="https://www.facebook.com/IRARealtyIndia/" target="_blank" rel="noopener noreferrer" className=" text-decoration-none ftrnormal">Facebook </a>
                  <span className="ftrnormal">|</span>
                  <a href="https://www.instagram.com/irarealtyindia" target="_blank" rel="noopener noreferrer" className=" text-decoration-none ftrnormal">Instagram</a>
                  <span className="ftrnormal">|</span>
                  <a href="" className=" text-decoration-none ftrnormal">Whatsapp</a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="w-100 d-flex flex-column align-items-center text-center gap-2 pt-4 pb-2" style={{ fontSize: "0.75rem" }}>
            <ul className="list-unstyled d-flex flex-wrap justify-content-center gap-3 mb-2 ftrsemibold">
              <li><a href="#home" className="text-white text-decoration-none">Home</a></li>
              <li><a href="#floor-plans" className="text-white text-decoration-none">Floor Plans</a></li>
              <li><a href="#contact-us" className="text-white text-decoration-none">Contact Us</a></li>
              <li><a href="https://irarealty.in/privacy-policy" className="text-white text-decoration-none" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
            </ul>

            <p className="px-3 mb-1 ftrnormal" style={{ maxWidth: "700px", lineHeight: "1.4" }}>
              This is purely a conceptual presentation and not a legal offering. The promoters reserve the right to make
              changes in elevation, specifications, and plans as deemed fit.
            </p>

            <p className="mb-0 ftrnormal">©2025 IRAREALTY</p>
          </div>
        </div>
      </div>

    </footer>
  );
}
