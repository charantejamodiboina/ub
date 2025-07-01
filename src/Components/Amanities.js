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
      className="text-white  ps-3 py-3 ps-md-5 position-relative mb-5"
      style={{ backgroundColor: "var(--amenitiesbg)" }}
      id="amenities"
    >
      <div className="container mx-auto ps-2 ps-lg-5 " style={{ maxWidth: "1500px" }}>
        <div className="row g-5 align-items-center mt-3 align-items-lg-center justify-content-lg-center">
          {/* Left Text Column */}
          <div className="col-sm-6 d-flex flex-column mt-sm-0 align-items-center justify-content-center ">

            <div className="Amanities_title align-self-start ">
              <span>Community &amp; Amenities</span>
            </div>
            <h2 className="py-2 fw-bold AHeading  align-self-start ">
              A Lifestyle that <br /> Breathes and Belongs
            </h2>
            <div className="datadiv  align-self-start ">
              <h5 className="mb-2 Adataheading">{data[activeIndex].name}</h5>
              <div className="text-white Adata">{data[activeIndex].points}</div>
            </div>


          </div>

          {/* Swiper Image Carousel */}
          <div className="col-sm-6 p-0 m-0">
            <Swiper
              modules={[Pagination]}
              loop={true}
              pagination={{ clickable: true }}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
              slidesPerView={1.3}

              className="swiper-amenities swam mt-4 mt-md-0 pt-0 pt-md-5"
              breakpoints={{
                320: {
                  spaceBetween: 10, // for small screens (e.g., mobile)
                },
                640: {
                  spaceBetween: 20, // for tablets
                },
                768: {
                  spaceBetween: 30, // for small laptops
                },
                1024: {
                  spaceBetween: 60, // for desktops
                },
              }}
            >
              {data.map((item) => (
                <SwiperSlide key={item.id} className="d-flex justify-content-center align-items-center swiperamenities">
                  <Image
                    src={isMobile ? item.mobileimage : item.image}
                    alt={item.name}
                    className=" rounded img-fluid"
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
          margin-top: 50px;
          display: flex;
          justify-content: flex-end;
          max-width: 70%;
        }

        @media (max-width: 992px) {
           :global(.swiper-amenities .swiper-pagination-bullet) {
          
          width: 10px;
          height: 5px;
          border-radius: 5px;
          transition: all 0.3s ease;
        }
        }

        :global(.swiper-amenities .swiper-pagination-bullet) {
          background: #999;
          opacity: 1;
          width: 25px;
          height: 5px;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        :global(.swiper-amenities .swiper-pagination-bullet-active) {
          background: #f7c24c;
          width: 25px;
          border-radius: 10px;
        }
      `}</style>
    </section>
  );
}
