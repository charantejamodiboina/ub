"use client";

import Image from "next/image";
import { useState } from "react";
import contactusbanner from "../assets/UrImages/desktop/c6.webp";
import { useMediaQuery } from "react-responsive";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";

export default function ContactUs() {
  const isMobile = useMediaQuery({ query: "(max-width: 991px)" });
  const isSMobile = useMediaQuery({ query: "(max-width: 500px)" });

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/FloorPlans.pdf";
    link.download = "Floor Plans.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("message", "Brochure Request via Contact Form");
      formData.append("email", "no-reply@urbanranch.com"); // required fallback
      formData.append("property", "Urban Ranch");

      await axios.post("https://irarealty.in/cms/api/submitContact", formData);

      alert("Submitted successfully!");
      setForm({ name: "", phone: "" });

      handleDownload(); // Auto download brochure
    } catch (error) {
      console.error("Submission error", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="text-white py-4 py-lg-5"
      id="contact-us"
      style={{ backgroundColor: "var(--amenitiesbg)" }}
    >
      <div className="container">
        <div className="row px-3 align-items-start justify-content-center">
          {!isMobile && (
            <div className="col-lg-8 d-flex justify-content-center">
              <Image
                src={contactusbanner}
                alt="Contact Banner"
                className="img-fluid rounded-3"
              />
            </div>
          )}

          <div className="col-lg-4">
            <h1 className="fw-bold mb-3 contactus_title">Ready to Make a Move?</h1>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
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

              <div className="mb-3">
                <input
                  type="tel"
                  name="phone"
                  className="form-control contactus_input"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-check text-start mb-4">
                <input
                  className="form-check-input checkboX"
                  type="checkbox"
                  id="authorization"
                  required
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.0)" }}
                />
                <label
                  className="form-check-label checkLabel"
                  htmlFor="authorization"
                  style={{ fontSize: 7 }}
                >
                  I authorize representatives of Urban Ranch to Call, SMS, Email or WhatsApp me
                  about its products and offers. This consent overrides any registration for
                  DNC/NDNC.
                </label>
              </div>

              <div className="d-flex flex-column gap-3 justify-content-start">
                <button
                  type="submit"
                  className="custom-btn contactus_s_btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Submitting...
                    </>
                  ) : isSMobile ? (
                    "Book a visit"
                  ) : (
                    "Schedule your site visit"
                  )}
                </button>

                <button
                  type="button"
                  className="custom-btn contactus_fp_btn"
                  onClick={handleDownload}
                >
                  Download Floor Plans
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
