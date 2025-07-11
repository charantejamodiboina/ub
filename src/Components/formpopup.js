"use client";

import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { Spinner } from "react-bootstrap";

let externalOpenModal = null; // Global function holder

const StartupModal = () => {
  const modalRef = useRef(null);
  const modalInstance = useRef(null);
  const [showContent, setShowContent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-open after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      showModal();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Make available globally
  useEffect(() => {
    externalOpenModal = showModal;
  }, []);

  const showModal = () => {
    if (!modalRef.current) return;
    import("bootstrap/js/dist/modal").then(({ default: Modal }) => {
      modalInstance.current = new Modal(modalRef.current);
      modalInstance.current.show();
      document.body.style.overflow = "hidden";

      modalRef.current.addEventListener(
        "shown.bs.modal",
        () => setShowContent(true),
        { once: true }
      );

      modalRef.current.addEventListener(
        "hidden.bs.modal",
        () => {
          setShowContent(false);
          document.body.style.overflow = "auto";
        },
        { once: true }
      );
    });
  };

  const handleClose = () => {
    modalInstance.current?.hide();
    setShowContent(false);
    document.body.style.overflow = "auto";
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

      handleClose();
    } catch (error) {
      console.error("Submission error", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade overflow-hidden"
      id="startupModal"
      tabIndex="-1"
      aria-hidden="true"
      ref={modalRef}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 bg-transparent">
          <div className="d-flex justify-content-center align-items-center">
            {showContent && (
              <div className="position-relative fade-in">
                <div
                  className="introForm bg-white shadow p-4 d-flex flex-column gap-2 w-100 align-items-center"
                  style={{ maxWidth: 500, maxHeight: 371 }}
                >
                  <h2 className="text-center form-heading">Unlock Pre Launch Pricing</h2>
                  <form onSubmit={handleSubmit} className="gap-2">
                    <div className="row g-3 mb-4 mt-3">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupModal;

// ✅ Export global trigger function
export const openStartupModal = () => {
  if (typeof window !== "undefined" && externalOpenModal) {
    externalOpenModal();
  }
};
