import Image from "next/image";
import ftrimg1 from "../assets/footer/ftrimg1.webp";
import ftrimg2 from "../assets/footer/ftrimg2.webp";
import ftrimg3 from "../assets/footer/ftrimg3.webp";

export default function DesktopFooter() {
  return (
    <footer className="text-white pt-5 px-4" style={{backgroundColor:"var(--amenitiesbg)"}}>
      <div className="container">
        <div className="row gx-5">
          {/* Left Column */}
          <div className="col-md-5 col-lg-4 d-flex flex-column gap-4">
            <div className="d-flex gap-3 align-items-center flex-wrap">
              <Image src={ftrimg1} alt="urban ranch logo" className="img-fluid" />
              <Image src={ftrimg2} alt="Iron horse logo" className="img-fluid" />
            </div>
            <Image src={ftrimg3} alt="IRA logo" className="img-fluid" />
            <div>
              <p className="mb-2">
                4-49/2, Besides Anvaya Conventions Road, Financial District,
                Vattinagulapally, Hyderabad - 500 032, Telangana
              </p>
              <div className="d-flex justify-content-between">
                <p className="mb-0">+91 9121 777 777</p>
                <p className="mb-0">info@irarealty.in</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-md-7 col-lg-8 mt-5 mt-md-0">
            <div className="d-flex flex-column gap-4">
              <div className="d-flex justify-content-between flex-wrap gap-4">
                {/* Quick Links */}
                <div>
                  <h5>Quick Links</h5>
                  <ul className="list-unstyled">
                    <li>Home</li>
                    <li>Floor Plans</li>
                    <li>Contact Us</li>
                    <li>Privacy Policy</li>
                  </ul>
                </div>

                {/* Social Media */}
                <div>
                  <h5>Social Media</h5>
                  <ul className="list-unstyled fw-light">
                    <li>Facebook</li>
                    <li>Whatsapp</li>
                  </ul>
                </div>

                {/* Sales Expert Contact */}
                <div>
                  <h5>Talk to our sales expert</h5>
                  <button
                    className="btn text-white"
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
                </div>
              </div>

              {/* Disclaimer */}
              <p className="fw-light mt-4">
                This is purely a conceptual presentation and not a legal offering.
                The promoters reserve the right to make changes in elevation,
                specifications, and plans as deemed fit.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="d-flex justify-content-end pt-4">
          <p className="mb-0">©2025 IRAREALTY</p>
        </div>
      </div>
    </footer>
  );
}
