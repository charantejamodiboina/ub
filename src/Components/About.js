import Image from "next/image";
import about1 from "../assets/About Images/aboutimg1.png";
import about2 from "../assets/About Images/aboutimg2.png";
import about3 from "../assets/About Images/aboutimg3.png";
import { CiLocationOn } from "react-icons/ci";
import { useMediaQuery } from "react-responsive";
export default function About() {
  
  const isMobile = useMediaQuery({ query: '(max-width: 1240px)' });
  const isSMobile = useMediaQuery({ query: '(max-width: 500px)' });
  const projects = [
    { name: "IRA The Square Villas", area: "Kongarakalan" },
    { name: "Moonglade Apartments", area: "Narsingi" },
    { name: "IRA Elevate Villas", area: "Shamshabad" },
  ];

  return (
  <div className="container-fluid py-5 px-5 bg-light d-flex justify-content-center align-items-center ">

      <div className="row gx-5 align-items-start flex-column-reverse flex-lg-row">
        {/* Image Section */}
        <div className="col-lg-6 d-flex flex-column gap-2 gap-md-3">
          <div className="d-flex gap-2 gap-md-3 align-items-md-center">
            <Image
              src={about1}
              alt="About Image 1"
              className="img-fluid rounded abtimg"
              style={{ width: !isMobile ? 301 : "55%" }}
            />
            <Image
              src={about2}
              alt="About Image 2"
              className="img-fluid rounded"
              style={{ width: !isMobile ? 225 :"41%" }}
            />
          </div>
          <Image
            src={about3}
            alt="About Image 3"
            className="img-fluid rounded "
            style={{width:!isMobile ? 537:"100%"}}
          />
        </div>

        {/* Content Section */}
        <div className="col-lg-6 d-flex flex-column gap-3 gap-xl-4 mt-xl-5">
          <p className="fw-semibold mb-0 Title">About IRA Realty</p>
          <h1 className=" fw-bold Heading">
            Building Homes. Nurturing Communities.
          </h1>
          <p className=" text-secondary aboutdata">
            At IRA Realty, we're redefining real estate with transparency, trust, and transformative design.
          </p>

          <h2 className="h4 text-dark mt-lg-4">Our Landmark Projects:</h2>

          <ul className="list-unstyled mt-lg-3 d-flex flex-column aboutdata " style={{gap:10}}>
            {projects.map((item, index) => (
              <li
                key={index}
                className="d-flex align-items-center mb-lg-3 text-secondary"
              >
                <div>
                  <div
                  className="d-flex justify-content-center align-items-center bg-success text-white rounded-circle me-3"
                  style={{ width: isSMobile?20:38, height: isSMobile?20:38 }}
                >
                  <CiLocationOn size={isSMobile?14:24} />
                </div>
                </div>
                
                <span className="fw-bold text-dark">
                  {item.name} —{" "}
                  <span className="fw-normal text-muted">{item.area}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
