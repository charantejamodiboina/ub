"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import gf from "../assets/Images/desktop/gfdesktop.webp";
import ff from "../assets/Images/desktop/ffdesktop.webp";
import img6 from "../assets/Vector.webp";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export default function FloorPlans() {
  const data = [
    {
      id: 1,
      type: "Type‑1",
      name: "East Facing Villa",
      floor: [
        { floor_name: "Ground Floor", built_up_area: "1523.32 SQ.FT", image: gf },
        { floor_name: "First Floor", built_up_area: "1551.31 SQ.FT", image: ff },
      ],
    },
    {
      id: 2,
      type: "Type‑1",
      name: "East Facing Villa",
      floor: [
        { floor_name: "First Floor", built_up_area: "1551.31 SQ.FT", image: ff },
        { floor_name: "Ground Floor", built_up_area: "1523.32 SQ.FT", image: gf },
      ],
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [modalImage, setModalImage] = useState(null);
  const modalRef = useRef(null);
  const modalInstance = useRef(null);
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/FloorPlans.pdf";
    link.download = "Floor Plans.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + data.length) % data.length);
  const handleNext = () =>
    setActiveIndex((prev) => (prev + 1) % data.length);

  const handleImageClick = (image) => {
    setModalImage(image);
  };

  const handleClose = () => {
    modalInstance.current?.hide();
  };

  useEffect(() => {
    if (!modalImage) return;

    import("bootstrap/js/dist/modal").then(({ default: Modal }) => {
      if (modalRef.current) {
        modalInstance.current = new Modal(modalRef.current, {
          backdrop: "static",
          keyboard: false,
        });
        modalInstance.current.show();

        // Lock scroll
        document.body.style.overflow = "hidden";

        modalRef.current.addEventListener(
          "hidden.bs.modal",
          () => {
            setModalImage(null);
            document.body.style.overflow = "";
          },
          { once: true }
        );
      }
    });
  }, [modalImage]);

  const villa = data[activeIndex];

  return (
    <div
      id="floor-plans"
      className="py-5 mb-5 text-white text-center"
      style={{
        background: "linear-gradient(to bottom, #CD9C40 70%, #158A44 30%)",
        position: "relative",
      }}
    >
      {/* Decorations */}
      <Image
        src={img6}
        alt="Decoration"
        width={162}
        height={145}
        className="position-absolute start-0"
        style={{ top: 0, zIndex: 0 }}
      />
      <Image
        src={img6}
        alt="Decoration"
        width={162}
        height={145}
        className="position-absolute end-0"
        style={{ top: 0 }}
      />

      <div className="container">
        <div className="px-3">
          <h1 className="fw-bold mb-3 Heading" style={{ position: "relative", zIndex: 10 }}>
            Spacious by Design.&nbsp;Smart by Default.
          </h1>
          <p className="fs-4 mb-4 floorplanssheading">Choose from East &amp; West‑facing villas:</p>
          <button onClick={handleDownload} className="btn btn-light text-warning fw-semibold px-4 mb-5">
            Download Floor Plans
          </button>

          <div className="d-flex align-items-center justify-content-between">
            <button
              className="btn border-0 d-flex align-items-center justify-content-center"
              onClick={handlePrev}
              style={{
                width: 33,
                height: 33,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                color: "white",
                padding: 0,
              }}
            >
              <IoChevronBack size={18} />
            </button>

            {/* Villa Card */}
            <div className="d-flex flex-column flex-lg-row align-items-start justify-content-between text-dark p-4 rounded w-100">
              <div className="text-lg-end text-light pt-3">
                <h2 className="fw-bold villa_type_dv">{villa.type}</h2>
                <h4 className="fw-bold villa_name_dv" style={{ whiteSpace: "nowrap" }}>{villa.name}</h4>
                <p className="floor_dv">{villa.floor[0].floor_name}</p>
                <p className="villa_bv_dv fw-bold">
                  Built-up Area:<br /><span style={{ fontWeight: 200 }}>{villa.floor[0].built_up_area}</span>
                </p>
              </div>

              <Image
                src={villa.floor[0].image}
                alt={`${villa.floor[0].floor_name} plan`}
                className="img-fluid rounded"
                style={{ cursor: "pointer" }}
                onClick={() => handleImageClick(villa.floor[0].image)}
              />
              <Image
                src={villa.floor[1].image}
                alt={`${villa.floor[1].floor_name} plan`}
                className="img-fluid rounded"
                style={{ cursor: "pointer" }}
                onClick={() => handleImageClick(villa.floor[1].image)}
              />

              <div className="text-lg-start text-light pt-3">
                <h2 className="fw-bold villa_type_dv">{villa.type}</h2>
                <h4 className="fw-bold villa_name_dv" style={{ whiteSpace: "nowrap" }}>{villa.name}</h4>
                <p className="floor_dv">{villa.floor[1].floor_name}</p>
                <p className="villa_bv_dv fw-bold">
                  Built-up Area:<br /><span style={{ fontWeight: 200 }}>{villa.floor[1].built_up_area}</span>
                </p>
              </div>
            </div>

            <button
              className="btn border-0 d-flex align-items-center justify-content-center"
              onClick={handleNext}
              style={{
                width: 33,
                height: 33,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                color: "white",
                padding: 0,
              }}
            >
              <IoChevronForward size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div
        className={`modal fade ${modalImage ? "show d-block" : ""}`}
        ref={modalRef}
        tabIndex="-1"
        aria-hidden="true"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1055,
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content bg-transparent border-0 position-relative">
            <button
              type="button"
              onClick={handleClose}
              className="position-absolute top-0 end-0 m-2 btn-close btn-close-white"
              style={{ zIndex: 10 }}
              aria-label="Close"
            ></button>

            <div className="modal-body p-0 overflow-auto text-center">
              {modalImage && (
                <Image
                  src={modalImage}
                  alt="Full-size floor plan"
                  className="img-fluid w-100"
                  style={{ maxHeight: "88vh", objectFit: "contain" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
