"use client";
import Image from "next/image";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import axios from "axios";
import DatePicker from "react-datepicker";
import iralogo from "../assets/images/desktop/Layer_1.webp";
import ihlogo from "../assets/images/desktop/Rectangle.webp";
import iralogom from "../assets/images/mobile/Layer_1.webp";
import ihlogom from "../assets/images/mobile/Rectangle.webp";
import { FaCalendarAlt } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import Spinner from "react-bootstrap/Spinner"; // Optional spinner (Bootstrap)
import { TbRosetteDiscountCheckFilled } from "react-icons/tb";

export default function Intro() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const isMobile = useMediaQuery({ query: "(max-width: 991px)" });
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = 'UR_MiniBrochure.pdf'; // PDF path relative to `public` folder
    link.download = 'UR_MiniBrochure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
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
    <section className="  align-items-end justify-content-end d-flex flex-column top-gradient" id="home" style={{maxHeight:851}}>
      <div className="container">
      <div className="row align-items-center g-5 ps-lg-5">
        {/* Left Content */}
        <div className="col-lg-8 text-white text-center text-lg-start">
          <div>
          <Image src={isMobile ? iralogom : iralogo} alt="logo" className="img-fluid me-4" priority />
          <Image src={isMobile ? ihlogom : ihlogo} alt="logo" className="img-fluid " priority />
          </div>
          <div                                                                       >
            <p className="mb-0 text-light font-nunito logodesc">A Project by Ira in Partnership with Iron Horse</p>
          </div>
          {/* <h1 className="font-seasons intro_h">
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
                Experience 19.5 Acres Of <br /> Gated Community Living At <br /> Urban Ranch
              </>
            ) : (
              <>
                Experience 19.5 acres of gated community living at <br />Urban Ranch
              </>
            )}
          </p>
           */}


        </div>

        {/* Right Form Box */}
        <div className="col-lg-4 d-flex justify-content-center align-items-center mt-0 flex-column">
          <div className="d-flex align-items-center rera justify-content-center font-poppins" >
            
            <TbRosetteDiscountCheckFilled color="white"/>
            <p className="text-light mb-0 ps-2 ">RERA APPROVED</p>
          </div>
          <div
            className="introForm bg-white shadow p-4 p-lg-4 d-flex flex-column justify-content-between w-100 h-100 mt-0"
            style={{ maxWidth: 315, maxHeight: 312 }}
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



              {/* <button
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
              </button> */}
            </form>
          </div>
          <button
            onClick={handleDownload}
            className="btn fw-bold px-4 py-2  intro_btn"
            style={{ color: "var(--active_nav_item)", backgroundColor: "white", borderWidth: 1, borderColor: "var(--active_nav_item)" }}
          >
            Download Brochure
          </button>
        </div>


      </div>

      </div>
      <div className="mt-3 mt-lg-5 mb-0 logoshadow w-100 p-5">
        <div className="container">
          
        </div>
      </div>

    </section>
  );
}
