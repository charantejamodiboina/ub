"use client";

import { useState } from "react";
import Image from "next/image";
import gf from "../assets/urdesktop/gfdesktop.webp";
import ff from "../assets/urdesktop/ffdesktop.webp";
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
      type: "Type‑2",
      name: "East Facing Villa",
      floor: [
        { floor_name: "Ground Floor", built_up_area: "1523.32 SQ.FT", image: ff },
        { floor_name: "First Floor", built_up_area: "1551.31 SQ.FT", image: gf },
      ],
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const villa = data[activeIndex];

  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + data.length) % data.length);
  const handleNext = () =>
    setActiveIndex((prev) => (prev + 1) % data.length);

  return (
    <div
      id="floor-plans"
      className="py-5 mb-5 text-white text-center"

      style={{
        background:
          "linear-gradient(to bottom, #CD9C40 70%, #158A44 30%)",
        position: "relative"
      }}
    >
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
        {/* ───── Title / CTA ───── */}
        <h1 className="fw-bold mb-3 Heading" style={{ zIndex: 10, position: "relative" }}>Spacious by Design.&nbsp;Smart by Default.</h1>
        <p className="fs-4 mb-4 floorplanssheading">Choose from East &amp; West‑facing villas:</p>
        <button className="btn btn-light text-warning fw-semibold px-4 mb-5">
          Download Floor Plans
        </button>

        {/* ───── Carousel Wrapper ───── */}
        <div className="d-flex align-items-center justify-content-between " style={{ width: "100%" }}>

          {/* Prev arrow */}
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

          {/* Villa card */}
          <div className="d-flex flex-column flex-lg-row align-items-start justify-content-between text-dark p-4 rounded  w-100">

            {/* Left details */}
            <div className="text-lg-end text-light pt-3">
              <h2 className="fw-bold villa_type_dv">{villa.type}</h2>
              <h4 className="fw-bold villa_name_dv" style={{whiteSpace: "nowrap"}}>{villa.name}</h4>
              <p className=" floor_dv" >{villa.floor[0].floor_name}</p>
              <p className=" villa_bv_dv" style={{ fontWeight: "bold"}}>
                Built-up Area:<br /><span style={{fontWeight:200}}>{villa.floor[0].built_up_area}</span>
                
              </p>
            </div>

            {/* Images */}
              <Image
                src={villa.floor[0].image}
                alt={`${villa.floor[0].floor_name} plan`}
                
                className="img-fluid rounded pe-2"
              />
              <Image
                src={villa.floor[1].image}
                alt={`${villa.floor[1].floor_name} plan`}
                
                className="img-fluid rounded"
              />

            {/* Right details */}
            <div className="text-lg-start text-light pt-3">
              <h2 className="fw-bold villa_type_dv">{villa.type}</h2>
              <h4 className="fw-bold villa_name_dv" style={{whiteSpace: "nowrap"}}>{villa.name}</h4>
              <p className=" floor_dv" >{villa.floor[1].floor_name}</p>
              <p className=" villa_bv_dv" style={{ fontWeight: "bold"}}>
                Built-up Area:<br /><span style={{fontWeight:200}}>{villa.floor[1].built_up_area}</span>
                
              </p>
            </div>
          </div>

          {/* Next arrow */}
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
    </div>
  );
}
