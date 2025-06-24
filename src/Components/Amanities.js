"use client";

import { useState } from "react";
import Image from "next/image";
import image2 from "../assets/c1.webp";
import image2mv from "../assets/c1mv.webp";
import { useMediaQuery } from "react-responsive";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
// import "./swiper-custom.css"; // for custom styles

export default function AmenitiesComponent() {
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useMediaQuery({ query: "(max-width: 475px)" });

  const data = [
    {
      id: 1,
      name: "Social & Community Spaces",
      points: (
        <ul className="mb-0">
          <li>Grand Clubhouse, Banquet Hall, Guest Suites</li>
          <li>Party Lawns, Amphitheater, Café‑style seating</li>
        </ul>
      ),
      image: image2,
      mobileimage: image2mv,
    },
    {
      id: 2,
      name: "Sports & Active Living",
      points: (
        <ul className="mb-0">
          <li>Futsal, Beach Volleyball, Basketball, Tennis, Badminton</li>
        </ul>
      ),
      image: image2,
      mobileimage: image2mv,
    },
    {
      id: 3,
      name: "Nature & Wellness",
      points: (
        <ul className="mb-0">
          <li>Edible Gardens, Tree Courts, Outdoor Gym, Yoga Decks, Infinity Pool</li>
        </ul>
      ),
      image: image2,
      mobileimage: image2mv,
    },
  ];

  return (
    <section
      className="text-white py-5"
      style={{ backgroundColor: "var(--amenitiesbg)" }}
      id="amenities"
    >
      <div className="container">
        <div className="row g-5 align-items-start mt-3 align-items-lg-center justify-content-lg-between">
          {/* Left Text Column */}
          <div className="col-lg-6">
            <div className="Amanities_title">
              <span>Community &amp; Amenities</span>
            </div>
            <h2 className="py-4 fw-bold AHeading">
              A Lifestyle that <br /> Breathes and Belongs
            </h2>
            <div className="datadiv">
              <h5 className="mb-2 Adataheading">{data[activeIndex].name}</h5>
              <div className="text-white Adata">{data[activeIndex].points}</div>
            </div>
          </div>

          {/* Swiper Image Carousel */}
          <div className="col-lg-6">
            <Swiper
              modules={[Pagination]}
              loop={true}
              pagination={{ clickable: true }}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              spaceBetween={16}
              slidesPerView={1.25}
              breakpoints={{
                0: { slidesPerView: 1.1 },
                768: { slidesPerView: 1.25 },
                1200: { slidesPerView: 1.5 },
              }}
              className="swiper-amenities"
            >
              {data.map((item) => (
                <SwiperSlide key={item.id}>
                  <Image
                    src={isMobile ? item.mobileimage : item.image}
                    alt={item.name}
                    width={400}
                    height={300}
                    className="w-100 h-auto rounded shadow"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* Swiper Custom Styling */}
      <style jsx>{`
  :global(.swiper-amenities .swiper-pagination) {
    position: relative;
    margin-top: 12px;
    text-align: center;
  }

  :global(.swiper-amenities .swiper-pagination-bullet) {
    background: #999;
    opacity: 1;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    transition: all 0.3s ease;
  }

  :global(.swiper-amenities .swiper-pagination-bullet-active) {
    background: #f7c24c;
    width: 24px;
    border-radius: 10px;
  }
`}</style>

    </section>
  );
}
