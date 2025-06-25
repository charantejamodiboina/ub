import Image from "next/image";
import { useState } from "react";
import ff from "../assets/villa images/ffmv.webp";
import gf from "../assets/villa images/ggmv.webp";

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

  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + data.length) % data.length);
  const handleNext = () =>
    setActiveIndex((prev) => (prev + 1) % data.length);

  const villa = data[activeIndex];

  return (
    <section
      id="floor-plans"
      className="py-5 text-center text-white"
      style={{
        background: "linear-gradient(to bottom, #CD9C40 60%, #158A44 40%)",
      }}
    >
      <div className="container">
        {/* Header Section */}
        <div className="mb-4 text-start">
          <h1 className="fw-bold mb-3 c8mvheading">Spacious by Design. Smart by Default.</h1>
          <p className="c8mvsubh" >Choose from East &amp; West-facing villas:</p>
          <button className=" mt-2 py-2 c8mvfpbutton">
            Download Floor Plans
          </button>
        </div>

        {/* Arrows */}
        <div className="d-flex justify-content-end mb-4 pe-3">
          <button
            className="btn btn-outline-light rounded-circle me-2 px-2 py-1"
            onClick={handlePrev}
            style={{ width: 32, height: 32 }}
          >
            ‹
          </button>
          <button
            className="btn btn-outline-light rounded-circle px-2 py-1"
            onClick={handleNext}
            style={{ width: 32, height: 32 }}
          >
            ›
          </button>
        </div>

        {/* Villa Cards */}
        <div className="row justify-content-center g-3">
          {villa.floor.map((floorItem, idx) => (
            <div key={idx} className="row-12 col-6">
                <Image
                  src={floorItem.image}
                  alt={floorItem.floor_name}
                  className="img-fluid rounded mb-3"
                />
                
                
                <div className="card-body text-light fpdata">
                  <h5 className="pt-3 villatype" >{villa.type}</h5>
                  <h6 className="villaname">{villa.name}</h6>
                  <p className="mb-1 floorname" >{floorItem.floor_name}</p>
                  <p className="mb-0 builtuparea" >
                    Built-up Area:<br />
                    {floorItem.built_up_area}
                  </p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
