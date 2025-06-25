import Image from "next/image";
import location from "../assets/location.webp";
import locationmv from "../assets/locmv.webp";
import { GoCheckCircleFill } from "react-icons/go";
import { useMediaQuery } from "react-responsive";
export default function LocationAdvantages() {
  const isMobile = useMediaQuery({ query: "(max-width: 991px)" });
  const issmallMobile = useMediaQuery({ query: "(max-width: 767px)" });
  const data = [
    { time: "10-15 mins to", place: "TCS, Tata Aerospace, Adibatla SEZ" },
    { time: "15-20 mins to", place: "Delhi Public School, Aga Khan Academy" },
    { time: "10-15 mins to", place: "Wonderla & upcoming World Trade Center" },
    { time: "25 mins to", place: "RGI Airport & ORR Exit 13" },
  ];

  return (
    <div className="container  py-5 px-4">
      <div className="row align-items-center g-5 flex-column-reverse flex-md-row">
        {/* Image Section */}
        <div className="col-12 col-md-5 d-flex justify-content-center">
          <Image src={issmallMobile?locationmv:location} alt="Location Advantages" className="img-fluid" />
        </div>

        {/* Text Content */}
        <div className="col-12 col-md-7 ">
          <div className="LaHbg">
            <p className=" fw-semibold mb-0 Title">Location Advantages</p>
          </div>
          <h1 className=" fw-bold mb-4 Heading">
            Close to What Matters. <br className="d-none d-md-block" />
            Away From What Doesn’t.
          </h1>

          <ul className="list-unstyled ">
            {data.map((item, index) => (
              <li key={index} className="d-flex align-items-center mb-3">
                <GoCheckCircleFill className="text-success me-3 flex-shrink-0" size={isMobile ? 16 : 28} />
                <span className="la_li">
                  <span className="fw-semibold" style={{ color: "#73788C" }}>{item.time}</span>
                  <span className="text-dark"> {item.place}</span>
                </span>
              </li>
            ))}
          </ul>

          <button className="btn mt-4 px-4 py-2 fw-semibold la_btn">
            Why Adibatla?
          </button>
        </div>
      </div>
    </div>
  );
}
