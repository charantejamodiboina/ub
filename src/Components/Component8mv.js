"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import ff from "../assets/UrImages/mobile/ffmobile.webp";
import gf from "../assets/UrImages/mobile/gfmobile.webp";
import img6mv from "../assets/decor.png";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function Component8mv() {
  const data = [
    {
      id: 1,
      type: "Type-1",
      name: "East Facing Villa",
      floor: [
        {
          floor_name: "Ground Floor",
          built_up_area: "1523.32 SQ.FT",
          image: gf,
        },
        {
          floor_name: "First Floor",
          built_up_area: "1551.31 SQ.FT",
          image: ff,
        },
      ],
    },
    {
      id: 2,
      type: "Type-2",
      name: "East Facing Villa",
      floor: [
        {
          floor_name: "Ground Floor",
          built_up_area: "1523.32 SQ.FT",
          image: ff,
        },
        {
          floor_name: "First Floor",
          built_up_area: "1551.31 SQ.FT",
          image: gf,
        },
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
      className="py-4 text-center text-white position-relative"
      style={{
        background: "linear-gradient(to bottom, #CD9C40 60%, #158A44 40%)",
      }}
    >
      <Image
        src={img6mv}
        alt="Decoration"
        className="position-absolute img-fluid"
        style={{ top: -15, right: 0 }}
      />
      <div className="container">
        <div className="px-3 pb-3 ">
          <div className="mb-4 text-start" style={{ zIndex: 10, position: "relative" }}>
            <h1 className="fw-bold mb-3 c8mvheading">
              Spacious by Design. Smart <br /> by Default.
            </h1>
            <p className="c8mvsubh">Choose from East &amp; West-facing villas:</p>
            <button onClick={handleDownload} className=" mt-2 py-2 c8mvfpbutton">Download Floor Plans</button>
          </div>

          <div className="d-flex justify-content-end mb-2 pe-3">
            <button
              className="btn btn-outline-light rounded-circle me-2 d-flex align-items-center justify-content-center"
              onClick={handlePrev}
              style={{
                width: 20,
                height: 20,
                backgroundColor: "rgba(260, 260, 260, 0.3)",
                border: "none",
                padding: 0,
              }}
            >
              <FiChevronLeft size={10} />
            </button>
            <button
              className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center"
              onClick={handleNext}
              style={{
                width: 20,
                height: 20,
                backgroundColor: "rgba(260, 260, 260, 0.3)",
                border: "none",
                padding: 0,
              }}
            >
              <FiChevronRight size={10} />
            </button>
          </div>

          <div className="row justify-content-center g-3">
            {villa.floor.map((floorItem, idx) => (
              <div key={idx} className="col-6 d-flex flex-column align-items-center">
                <div className="w-100">
                  <Image
                    src={floorItem.image}
                    alt={floorItem.floor_name}
                    className="mb-3"
                    style={{ width: "100%", height: "auto", borderRadius: 10, cursor: "pointer" }}
                    onClick={() => handleImageClick(floorItem.image)}
                    placeholder="blur"
                  />
                  <div className="card-body text-light text-start ps-3 fpdata">
                    <h5 className="villatype">{villa.type}</h5>
                    <h6 className="villaname">{villa.name}</h6>
                    <p className="mb-1 floorname">{floorItem.floor_name}</p>
                    <p className="mb-0 builtuparea">
                      Built-up Area:
                      <br />
                      <span style={{ fontWeight: 200 }}>{floorItem.built_up_area}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
