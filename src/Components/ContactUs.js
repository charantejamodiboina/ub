
"use client";

import Image from "next/image";
import { useState } from "react";
import contactusbanner from "../assets/c6.webp";
import { useMediaQuery } from "react-responsive";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Spinner from "react-bootstrap/Spinner"; // Optional spinner

export default function ContactUs() {
  const isMobile = useMediaQuery({ query: "(max-width: 991px)" });
  const isSMobile = useMediaQuery({ query: "(max-width: 500px)" });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: null, // now a Date object
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (selectedDate) => {
    setForm({ ...form, date: selectedDate });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("message", "Schedule Date is: " + (form.date ? form.date.toLocaleDateString() : ""));
      formData.append("email", form.email);
      formData.append("property", "Urban Ranch");

      await axios.post("https://irarealty.in/cms/api/submitContact", formData);
      alert("Submitted successfully!");

      // Reset form
      setForm({ name: "", phone: "", date: null, email: "" });
    } catch (error) {
      console.error("Submission error", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white py-4 py-lg-5 " id="contact-us" style={{ backgroundColor: "var(--amenitiesbg)" }}>
      <div className="container">
      <div className="row px-3 align-items-start justify-content-center ">
        {!isMobile && (
          <div className="col-lg-5 d-flex justify-content-center">
            <Image src={contactusbanner} alt="Contact Banner" className="img-fluid rounded-3" />
          </div>
        )}

        <div className="col-lg-7">
          <h1 className="fw-bold mb-3 contactus_title">Ready to Make a Move?</h1>
          <p className=" mb-4 contactus_sh">
            Choose the villa lifestyle that blends luxury with legacy.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-6 pe-1">
                <input
                  type="text"
                  name="name"
                  className="form-control contactus_input "
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-6 ps-1">
                <input
                  type="email"
                  name="email"
                  className="form-control contactus_input"
                  placeholder="Email Address"
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
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <DatePicker
                  selected={form.date}
                  onChange={handleDateChange}
                  className="form-control contactus_input"
                  placeholderText="Select Date"
                  dateFormat="dd/MM/yyyy"
                  required
                />
              </div>
            </div>

            <div className="form-check text-start mb-4">
              <input className="form-check-input checkboX" type="checkbox" id="authorization" style={{backgroundColor : "rgba(255, 255, 255, 0.0)"}}/>
              <label className="form-check-label checkLabel" htmlFor="authorization">
                I authorize representatives of Urban Ranch to Call, SMS, Email or WhatsApp me about its products and
                offers. This consent overrides any registration for DNC/NDNC.
              </label>
            </div>

            <div className="d-flex flex-nowrap gap-3 justify-content-start">
              <button type="submit" className="custom-btn contactus_s_btn" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Submitting...
                  </>
                ) : (
                  isSMobile ? "Book a visit" : "Schedule your site visit"
                )}
              </button>
              <button type="button" className="custom-btn contactus_fp_btn">
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
