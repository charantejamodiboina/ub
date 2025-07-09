import { useMediaQuery } from "react-responsive";
import Image from "next/image";
// import quotes from "../assets/ct/quotes.webp";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export default function CustomerTestimonials() {
  const isMobile = useMediaQuery({ query: "(max-width: 991px)" });

  const data = [
    {
      id: 1,
      customer_name: "Priya & Arjun",
      customer_occupation: "NRI Investors",
      customer_voice: "Felt Right Instantly",
      customer_voice2:
        "We moved from overseas and found not just a home, but a community. Our kids have friends. We have peace.",
      color: "#7CBB00",
    },
    {
      id: 2,
      customer_name: "Kiran Reddy",
      customer_occupation: "Tech Entrepreneur",
      customer_voice: "Perfect Blend of Life",
      customer_voice2:
        "Urban Ranch was love at first sight. Where else do you find the luxury of a serene green space close to Abibatla TCS?",
      color: "#F79F24",
    },
    {
      id: 3,
      customer_name: "Meera & Sanjay",
      customer_occupation: "Business Owners",
      customer_voice: "Luxury with a Heart",
      customer_voice2:
        "A combination of a sleek design and rooted lifestyle was what we were looking for. Urban Ranch gave us that exactly!",
      color: "#00A1F1",
    },
  ];

  const getInitials = (fullName) => {
    if (!fullName) return "";
    const hasAmpersand = fullName.includes("&");
    const words = fullName.split(" ").filter(Boolean);
    if (hasAmpersand) {
      const initials = words
        .filter((word) => word !== "&")
        .map((word) => word[0].toUpperCase());
      return initials.slice(0, 2).join("");
    } else {
      return words[0][0].toUpperCase();
    }
  };

  return (
    <div className="py-4 py-md-5" style={{ backgroundColor: "#f2f6f8" }}>
      <div className="container">
        <div className="px-3">
          <div className="CtTBg title-container">
            <p className="m-0 Title">Customer Testimonials</p>
          </div>

          <h1 className="fw-bold mb-3 Heading">
            Built with Heart.
            {isMobile && <br />} Backed by Trust.
          </h1>

          <Swiper
            slidesPerView={isMobile ? 2 : 3}
            spaceBetween={20}
            pagination={false}
            modules={[Pagination]}
            loop={true}
          >
            {data.map((item) => (
              <SwiperSlide key={item.id}>
                <div
                  className="border rounded-2 h-100 p-3 d-flex flex-column justify-content-between shadow-sm"
                  style={{
                    borderColor: "#DEDCDA",
                    backgroundColor: "#FEFEFF",
                    height: "100%",
                  }}
                >
                  <div>
                    <Image src={quotes} className="img-fluid mb-2" alt="quotes" />
                    <h3
                      className="h5 fw-semibold mb-2 ctText"
                      style={{ fontSize: isMobile ? 10 : 24, color:"#1f2744" }}
                    >
                      {item.customer_voice}
                    </h3>
                    <p
                      className=" ctText2"
                      style={{ fontSize: isMobile ? 8 : 18, height: isMobile ? 40 : 100, color:"#1f2744"}}
                    >
                      {item.customer_voice2}
                    </p>
                  </div>

                  <div className="d-flex align-items-center mt-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-2 me-lg-3 cticon"
                      style={{
                        backgroundColor: item.color,
                        width: isMobile ? 20 : 51,
                        height: isMobile ? 20 : 51,
                        fontSize: isMobile ? 7 : 18,
                        fontWeight: "600",
                        color: "white",
                      }}
                    >
                      {getInitials(item.customer_name)}
                    </div>
                    <div>
                      <p
                        className="mb-0 fw-semibold ctText2"
                        style={{ fontSize: isMobile ? 7 : 18, color:"#0b2e29"}}
                      >
                        {item.customer_name}
                      </p>
                      <p
                        className="mb-0 text-muted ctText2"
                        style={{ fontSize: isMobile ? 7 : 18, color:"#767676" }}
                      >
                        {item.customer_occupation}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
