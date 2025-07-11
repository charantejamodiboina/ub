"use client";
import Image from "next/image";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import axios from "axios";
import mlogo from "../assets/Images/mobile/Group801.webp";
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
      formData.append("message", "Startup Modal Submission");
      formData.append("email", ""); // dummy
      formData.append("property", "Urban Ranch");

      await axios.post("https://irarealty.in/cms/api/submitContact", formData);

      alert("Submitted successfully!");
      setName("");
      setPhone("");

      const link = document.createElement("a");
      link.href = "/UR_MiniBrochure.pdf";
      link.download = "UR_MiniBrochure.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // handleClose();
    } catch (error) {
      console.error("Submission error", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="  align-items-start justify-content-center justify-content-lg-end d-flex flex-column top-gradient  pb-5" id="home" style={{ height: "100vh" }}>
      {/* <Image src={isMobile ? null : overlay} alt="logo" className="img-fluid me-4" priority /> */}
            

      <div className="d-flex flex-column  w-100 g-5 ps-lg-5 container">

        <div className="flex-end " >
          
          {isMobile ? <div className="d-flex align-items-center justify-content-center my-5"><Image
            src={mlogo}
            alt="Mobile Logo"
            priority
            className="img-fluid"
            
          /></div> : null}
          <div className="d-flex justify-content-center justify-content-lg-end form-box ">
            <div className="d-flex align-items-center justify-content-end flex-column">
              <div className="d-flex align-items-center rera justify-content-center font-poppins" >

                <TbRosetteDiscountCheckFilled color="white" />
                <p className="text-light mb-0 ps-2 ">RERA APPROVED</p>
              </div>
              <div className="position-relative ">
                <div
                  className="introForm1 bg-white p-4 p-lg-4 d-flex flex-column justify-content-between align-items-center position-relative"
                  style={{zIndex: 10 }}
                >
                  <h2 className="text-center form-heading">Unlock Pre Launch Pricing</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3 mb-3 mt-3 mt-lg-4">

                      <input
                        type="text"
                        className="form-control introinput1"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <input
                        type="tel"
                        className="form-control introinput1"
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
                  type="submit"
                  className="btn w-100 introdb position-absolute pt-3 pt-lg-4"

                  disabled={loading}
                  onClick={handleSubmit}
                  style={{ backgroundColor: "var(--active_nav_item)", color: "white", }}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Submitting...
                    </>
                  ) : (
                    "Download Brochure"
                  )}
                </button>
              </div>

              {/* <button
                onClick={handleSubmit}
                className="btn fw-bold px-4 py-2  intro_btn"
                style={{ color: "var(--active_nav_item)", backgroundColor: "white", borderWidth: 1, borderColor: "var(--active_nav_item)" }}
              >
                Download Brochure
              </button> */}
            </div>
          </div>
        </div>

        <div className="d-flex flex-column align-items-center align-items-lg-start">
          <div>
            <Image src={isMobile ? iralogom : iralogo} alt="logo" className="img-fluid me-4" priority />
            <Image src={isMobile ? ihlogom : ihlogo} alt="logo" className="img-fluid " priority />
          </div>

          <div                                                                       >
            <p className="mb-0 text-light font-nunito logodesc">A Project by Ira in Partnership with Iron Horse</p>
          </div>
        </div>
        

      </div>




    </section>
  );
}
