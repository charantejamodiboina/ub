"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import image2 from "../assets/c1.webp";
import image2mv from "../assets/c1mv.webp";
import { useMediaQuery } from "react-responsive";

export default function AmenitiesComponent() {
  const scrollRef = useRef(null);
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

  const handleScroll = () => {
    const { scrollLeft } = scrollRef.current;
    const card = scrollRef.current.firstChild;
    if (card) {
      const cardWidth = card.offsetWidth + 16;
      const index = Math.round(scrollLeft / cardWidth);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  const scrollByCard = (direction) => {
    const card = scrollRef.current.firstChild;
    if (card) {
      const cardWidth = card.offsetWidth + 16;
      scrollRef.current.scrollBy({
        left: direction * cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="text-white py-5" style={{ backgroundColor: "var(--amenitiesbg)" }} id="amenities">
      <div className="container">
        <div className="row g-5 align-items-start">
          {/* Left Text Column */}
          <div className="col-lg-5">
            <div className="Amanities_title">
              <span>Community &amp; Amenities</span>
            </div>
            <h2 className="py-4 fw-bold AHeading">
              A Lifestyle that <br /> Breathes and Belongs
            </h2>
            <div className="datadiv">
              <h5 className="mb-2 Adataheading">{data[activeIndex].name}</h5>
              <div className="text-white fs-6 Adata">{data[activeIndex].points}</div>
            </div>
          </div>

          {/* Right Image Carousel */}
          <div className="col-lg-7 position-relative">
            {/* Arrows */}
            <button
              onClick={() => scrollByCard(-1)}
              className="carousel-arrow left-arrow"
              aria-label="Scroll left"
            >
              ◀
            </button>
            <button
              onClick={() => scrollByCard(1)}
              className="carousel-arrow right-arrow"
              aria-label="Scroll right"
            >
              ▶
            </button>

            <div
              className="d-flex hide-scrollbar"
              ref={scrollRef}
              onScroll={handleScroll}
              style={{
                gap: "16px",
                overflowX: "scroll",
                overflowY: "hidden",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {data.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded shadow flex-shrink-0"
                  style={{
                    minWidth: isMobile ? "200px" : "400px",
                    transition: "opacity 0.3s ease",
                    scrollSnapAlign: "start",
                    opacity: index === activeIndex ? 1 : 0.5,
                  }}
                >
                  <Image
                    src={isMobile ? item.mobileimage : item.image}
                    alt={item.name}
                    width={400}
                    height={300}
                    className="w-100 h-auto"
                  />
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="d-flex justify-content-center mt-3">
              {data.map((_, index) => (
                <span
                  key={index}
                  onClick={() => {
                    const card = scrollRef.current.firstChild;
                    if (card) {
                      const cardWidth = card.offsetWidth + 16;
                      scrollRef.current.scrollTo({
                        left: index * cardWidth,
                        behavior: "smooth",
                      });
                      setActiveIndex(index);
                    }
                  }}
                  style={{
                    cursor: "pointer",
                    width: "35px",
                    height: "4px",
                    margin: "7px 2px",
                    borderRadius: "10px",
                    backgroundColor: index === activeIndex ? "#f7c24c" : "#555",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .carousel-arrow {
          position: absolute;
          top: 40%;
          z-index: 2;
          background-color: rgba(0, 0, 0, 0.4);
          color: white;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .left-arrow {
          left: -18px;
        }

        .right-arrow {
          right: -18px;
        }

        @media (max-width: 768px) {
          .carousel-arrow {
            top: 35%;
            width: 28px;
            height: 28px;
            font-size: 14px;
          }
        }
      `}</style>
    </section>
  );
}
