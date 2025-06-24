"use client";

import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import axios from "axios";
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import Spinner from "react-bootstrap/Spinner"; // Optional spinner (Bootstrap)

export default function Intro() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const isMobile = useMediaQuery({ query: "(max-width: 991px)" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("message", "Schedule Date is: " + (date ? date.toLocaleDateString() : ""));
      formData.append("email", email);
      formData.append("property", "Urban Ranch");

      await axios.post("https://irarealty.in/cms/api/submitContact", formData);
      alert("Submitted successfully!");
      setName("");
      setPhone("");
      setDate(null);
      setEmail("");
    } catch (error) {
      console.error("Submission error", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container my-5 ps-lg-5 align-items-center" id="home">
      <div className="row align-items-center g-5 ps-lg-5">
        {/* Left Content */}
        <div className="col-lg-6 text-white text-center text-lg-start">
          <h1 className="font-seasons intro_h">
            {isMobile ? (
              <>
                4BHK<br />GATED VILLA<br />COMMUNITY IN<br />ADIBATLA
              </>
            ) : (
              <>
                4BHK Gated<br />Villa Community in<br />Adibatla
              </>
            )}
          </h1>
          <p className="intro_desc" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
            {isMobile ? (
              <>
                Experience 17 Acres Of <br /> Gated Community <br /> Living At Urban Ranch
              </>
            ) : (
              <>
                Experience 17 acres of gated community living <br/> at Urban Ranch
              </>
            )}
          </p>
          <button
            className="btn fw-bold px-4 py-2 mt-3"
            style={{ color: "var(--active_nav_item)", backgroundColor: "white", borderWidth: 1, borderColor: "var(--active_nav_item)" }}
          >
            Download Brochure
          </button>
        </div>

        {/* Right Form Box */}
        <div className="col-lg-6 d-flex justify-content-center">
          <div
            className="introForm bg-white shadow p-4 p-lg-5 d-flex flex-column justify-content-between w-100"
            style={{ maxWidth: 474, maxHeight: "fit-content" }}
          >
            <h2 className="text-center text-dark form-heading">Unlock Early Access</h2>
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3 mt-3 mt-lg-4">
                <div className="col-6">
                  <input
                    type="text"
                    className="form-control introinput"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <input
                    type="tel"
                    className="form-control introinput"
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3 position-relative">
                <DatePicker
                  selected={date}
                  onChange={(date) => setDate(date)}
                  className="form-control introinput"
                  placeholderText="Select date"
                  dateFormat="dd/MM/yyyy"
                  required
                />
                <FaCalendarAlt className="calendar-icon" />
              </div>

              <div className="mb-4">
                <input
                  type="email"
                  className="form-control introinput"
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn w-100 introFbtn"
                disabled={loading}
                style={{ backgroundColor: "var(--active_nav_item)", color: "white" }}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Submitting...
                  </>
                ) : (
                  "Book a visit"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
