import Image from "next/image";
import { useState } from "react";
import contactusbanner from "../assets/c6.png";
import { useMediaQuery } from "react-responsive";
import axios from "axios";

export default function ContactUs() {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const isSMobile = useMediaQuery({ query: "(max-width: 500px)" });

  const [form, setForm] = useState({ name: "", phone: "", date: "", email: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("message", "Schedule Date is: " + form.date);
      formData.append("email", form.email);
      formData.append("property", "Urban Ranch");

      await axios.post("https://irarealty.in/cms/api/submitContact", formData);
      alert("Submitted successfully!");
      setForm({ name: "", phone: "", date: "", email: "" });
    } catch (error) {
      console.error("Submission error", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container-fluid text-white py-5" id="contact-us" style={{ backgroundColor: "var(--amenitiesbg)" }}>
      <div className="row g-5 align-items-start justify-content-center px-4">
        {!isMobile && (
          <div className="col-lg-6 d-flex justify-content-center">
            <Image src={contactusbanner} alt="Contact Banner" className="img-fluid rounded-3" />
          </div>
        )}

        <div className="col-lg-6">
          <h1 className="fw-bold mb-3 contactus_title">Ready to Make a Move?</h1>
          <p className="fs-5 mb-4 contactus_sh">
            Choose the villa lifestyle that blends luxury with legacy.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <input
                  type="text"
                  name="name"
                  className="form-control contactus_input"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-6">
                <input
                  type="email"
                  name="email"
                  className="form-control contactus_input"
                  placeholder="Email ID"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <input
                  type="tel"
                  name="phone"
                  className="form-control contactus_input"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="date"
                  name="date"
                  className="form-control contactus_input"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-check text-start mb-4">
              <input className="form-check-input" type="checkbox" id="authorization" />
              <label className="form-check-label" htmlFor="authorization">
                I authorize representatives of Urban Ranch to Call, SMS, Email or WhatsApp me about its products and
                offers. This consent overrides any registration for DNC/NDNC.
              </label>
            </div>

            <div className="d-flex flex-nowrap gap-3 justify-content-start">
              <button type="submit" className="custom-btn contactus_s_btn">
                {isSMobile ? "Book a visit" : "Schedule your site visit"}
              </button>
              <button type="button" className="custom-btn contactus_fp_btn">
                Download Floor Plans
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
