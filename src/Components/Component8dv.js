"use client";

import { useState } from "react";
import Image from "next/image";
import gf from "../assets/villa images/groundfloor.png";
import ff from "../assets/villa images/firstfloor.png";

export default function FloorPlans() {
  const data = [
    {
      id: 1,
      type: "Type‑1",
      name: "East Facing Villa",
      floor: [
        { floor_name: "Ground Floor", built_up_area: "1523.32 SQ.FT", image: gf },
        { floor_name: "First Floor",  built_up_area: "1551.31 SQ.FT", image: ff },
      ],
    },
    {
      id: 2,
      type: "Type‑2",
      name: "East Facing Villa",
      floor: [
        { floor_name: "Ground Floor", built_up_area: "1523.32 SQ.FT", image: ff },
        { floor_name: "First Floor",  built_up_area: "1551.31 SQ.FT", image: gf },
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
    <section
      id="floor-plans"
      className="py-5 text-white text-center"
      style={{
        background:
          "linear-gradient(to bottom, #CD9C40 70%, #158A44 30%)",
      }}
    >
      <div className="container">

        {/* ───── Title / CTA ───── */}
        <h1 className="fw-bold mb-3 Heading">Spacious by Design.&nbsp;Smart by Default.</h1>
        <p className="fs-4 mb-4 floorplanssheading">Choose from East &amp; West‑facing villas:</p>
        <button className="btn btn-light text-warning fw-semibold px-4 mb-5">
          Download Floor Plans
        </button>

        {/* ───── Carousel Wrapper ───── */}
        <div className="d-flex align-items-center justify-content-between " style={{width:"100%"}}>

          {/* Prev arrow */}
          <button
            className="btn border-0"
            onClick={handlePrev}
            style={{ width: 48, height: 48, borderRadius:50, backgroundColor:"rgba(260, 260, 260, 0.3)", color:"white" }}
          >
            ‹
          </button>

          {/* Villa card */}
          <div className="d-flex flex-column flex-lg-row align-items-center gap-4 text-dark p-4 rounded  w-100" style={{ maxWidth: 1000 }}>
            
            {/* Left details */}
            <div className="text-lg-end text-light flex-grow-1">
              <h2 className="fw-bold mb-1">{villa.type}</h2>
              <h4 className="mb-3">{villa.name}</h4>
              <p className="mb-2">{villa.floor[0].floor_name}</p>
              <p className="mb-0">
                Built‑up Area:<br />
                <strong>{villa.floor[0].built_up_area}</strong>
              </p>
            </div>

            {/* Images */}
            <div className="d-flex flex-column flex-md-row justify-content-center gap-4">
              <Image
                src={villa.floor[0].image}
                alt={`${villa.floor[0].floor_name} plan`}
                width={300}
                height={250}
                className="img-fluid rounded"
              />
              <Image
                src={villa.floor[1].image}
                alt={`${villa.floor[1].floor_name} plan`}
                width={300}
                height={250}
                className="img-fluid rounded"
              />
            </div>

            {/* Right details */}
            <div className="text-lg-start text-light flex-grow-1">
              <h2 className="fw-bold mb-1">{villa.type}</h2>
              <h4 className="mb-3">{villa.name}</h4>
              <p className="mb-2">{villa.floor[1].floor_name}</p>
              <p className="mb-0">
                Built‑up Area:<br />
                <strong>{villa.floor[1].built_up_area}</strong>
              </p>
            </div>
          </div>

          {/* Next arrow */}
          <button
            className="btn btn-light border-0"
            onClick={handleNext}
            style={{ width: 48, height: 48, height: 48, borderRadius:50, backgroundColor:"rgba(260, 260, 260, 0.3)", color:"white" }}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
