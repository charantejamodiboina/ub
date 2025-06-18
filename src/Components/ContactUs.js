import Image from "next/image";
import { useState } from "react";
import contactusbanner from "../assets/c6.png";
import { useMediaQuery } from "react-responsive";
export default function ContactUs() {

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const isSMobile = useMediaQuery({ query: '(max-width: 500px)' });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [email, setEmail] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("message", "Schedule Date is: " + date);
      formData.append("email", email);
      formData.append("property", "Urban Ranch");

      await axios.post("https://irarealty.in/cms/api/submitContact", formData);
      alert("Submitted successfully!");
      setName("");
      setPhone("");
      setDate("");
      setEmail("");
    } catch (error) {
      console.error("Submission error", error);
      alert("Something went wrong. Please try again.");
    }
  };
  return (
    <div className="container-fluid text-white py-5" id="contact-us" style={{ backgroundColor: "var(--amenitiesbg)" }}>
      <div className="row g-5 align-items-start justify-content-center px-4">
        {isMobile ? null : <div className="col-lg-6 d-flex justify-content-center">
          <Image
            src={contactusbanner}
            alt="Contact Banner"
            className="img-fluid rounded-3"
          />
        </div>}

        <div className="col-lg-6">
          <h1 className=" fw-bold mb-3 contactus_title">Ready to Make a Move?</h1>
          <p className="fs-5 mb-4 contactus_sh">
            Choose the villa lifestyle that blends luxury with legacy.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <input
                  type="text"
                  className="form-control contactus_input"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="col-6">
                <input
                  type="email"
                  className="form-control contactus_input"
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <input
                  type="tel"
                  className="form-control contactus_input"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="date"
                  placeholder="Schedule a date"
                  className="form-control contactus_input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
            </div>

            <div className="form-check text-start mb-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="authorization"
              />
              <label className="form-check-label" htmlFor="authorization">
                I authorize representatives of Urban Ranch to Call, SMS, Email
                or WhatsApp me about its products and offers. This consent
                overrides any registration for DNC/NDNC.
              </label>
            </div>

            <div className="d-flex flex-nowrap gap-3 justify-content-start">
              <div className=" col-6 contactus_s_btn">
                <button type="submit" className=" " style={{ border: "none", color: "white", backgroundColor: "var(--primary)" }}>
                  
                  {isSMobile? "Book a visit" :"Schedule your site visit"}
                </button>
                
              </div>
              <div className=" col-6 contactus_fp_btn">
                <button
                  type="button"
                  className=""
                  style={{ border: "none", color: "white", backgroundColor: "var(--amenitiesbg)" }}
                >
                  Download Floor Plans
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
