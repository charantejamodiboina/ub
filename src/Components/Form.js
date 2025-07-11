"use client";
import Image from "next/image";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import axios from "axios";
import DatePicker from "react-datepicker";
import iralogo from "../assets/Images/desktop/Layer_1.webp";
import ihlogo from "../assets/Images/desktop/Rectangle.webp";
import iralogom from "../assets/Images/mobile/Layer_1m.webp";
import ihlogom from "../assets/Images/mobile/Rectanglem.webp";
import { FaCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import Spinner from "react-bootstrap/Spinner"; // Optional spinner (Bootstrap)

export default function Form() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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

    // Reset form
    setName("");
    setPhone("");
    setDate(null);
    setEmail("");

    // ✅ Trigger brochure download
    const link = document.createElement("a");
    link.href = "/UR_MiniBrochure.pdf"; // path must be under `public/` folder
    link.download = "UR_MiniBrochure.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error("Submission error", error);
    alert("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    

       
        <div className="col-lg-4 d-flex justify-content-center mt-0">
          <div
            className="introForm bg-white shadow p-2 p-lg-4 d-flex flex-column justify-content-between w-100 h-100 mt-0"
            style={{ maxWidth: 315, maxHeight:312 }}
          >
            <h2 className="text-center form-heading">Unlock Pre Launch Pricing</h2>
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3 mt-3 mt-lg-4">
                
                  <input
                    type="text"
                    className="form-control introinput"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="tel"
                    className="form-control introinput"
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
        
      
  );
}
