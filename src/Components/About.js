import Image from "next/image";
import about1 from "../assets/Images/desktop/au1.webp";
import about2 from "../assets/Images/desktop/au2.webp";
import about3 from "../assets/Images/desktop/au3.webp";
import aboutm1 from "../assets/Images/mobile/ip1.webp";
import aboutm2 from "../assets/Images/mobile/ip2.webp";
import aboutm3 from "../assets/Images/mobile/ip.webp";
import { CiLocationOn } from "react-icons/ci";
import { useMediaQuery } from "react-responsive";
export default function About() {

  const isMobile = useMediaQuery({ query: '(max-width: 991px)' });
  const isSMobile = useMediaQuery({ query: '(max-width: 500px)' });
  const projects = [
    { name: "IRA The Square Villas", area: "Kongarakalan" },
    { name: "Moonglade Apartments", area: "Narsingi" },
    { name: "IRA Elevate Villas", area: "Shamshabad" },
  ];

  return (
    <div className="py-4 py-lg-5 d-flex justify-content-center align-items-center ">
      <div className="container ">
        <div>
          <div className="row px-3 align-items-start flex-lg-row ">
            <div className="title-container AbTbg">
              <p className="fw-semibold mb-0 Title">IRA Realty Ongoing Projects</p>
            </div>

            <h1 className=" fw-bold Heading">
              Building Homes. Nurturing Communities.
            </h1>
            <p className=" text-secondary aboutdata">
              At IRA Realty, we're redefining real estate with transparency, trust, and transformative design.
            </p>
          </div>
        </div>
        <div className="row font-nunito">
          <div className="col-12 col-lg-4 pb-2 position-relative text-white d-flex justify-content-center align-items-center">
            <Image
            src={isMobile? aboutm1 :about1}
            alt="About Image 1"
            className="img-fluid rounded w-100"
          />
          <div className="position-absolute bottom-0 start-0 w-100 text-center p-3"
    style={{ zIndex: 1 }}>
            <p className="irap">IRA THE SQUARE</p>
          <p className="irap2">4 BHK VILLAS AT ADIBATLA</p>
          </div>
          
          </div>
          <div className="col-12 col-lg-4 pb-2 position-relative text-white d-flex justify-content-center align-items-center">
            <Image
            src={isMobile? aboutm2 :about2}
            alt="About Image 2"
            className="img-fluid rounded w-100"
          />
          <div className="position-absolute bottom-0 start-0 w-100 text-center p-3"
    style={{ zIndex: 1 }}>
          <p className="irap">MOONGLADE APARTMENTS</p>
          <p className="irap2">3 & 4 BHK APARTMENT AT KOKAPET</p>
          </div>
          </div>
          <div className="col-12 col-lg-4 pb-2 position-relative text-white d-flex justify-content-center align-items-center">
            <Image
            src={isMobile? aboutm3 :about3}
            alt="About Image 3"
            className="img-fluid rounded w-100"
          />
          <div className="position-absolute bottom-0 start-0 w-100 text-center p-3"
    style={{ zIndex: 1 }}>
          <p className="irap">IRA ELEVATE VILLAS </p>
          <p className="irap2">4 BHK VILLAS AT SHAMSHABAD</p>
          </div>
          </div>
        </div>
        {/* Content Section */}

      </div>
    </div>

  );
}
