import Image from "next/image";
import villa from "../assets/UrImages/desktop/2.webp";
import villa2 from "../assets/UrImages/desktop/15.webp";
import mvilla from "../assets/UrImages/mobile/vs1.webp";
import mvill2 from "../assets/UrImages/mobile/vs2.webp";
import areaIcon from "../assets/specicons/area.png";
import locationIcon from "../assets/specicons/location.png";
import typeIcon from "../assets/specicons/type.png";
import totalVillasIcon from "../assets/specicons/totalvillas.png";
import plotAreaIcon from "../assets/specicons/plotarea.png";
import villaAreaIcon from "../assets/specicons/villaarea.png";
import structureIcon from "../assets/specicons/structure.png";
import clubhouseIcon from "../assets/specicons/clubhouse.png";
import { useMediaQuery } from "react-responsive";
export default function VillaSpecs() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const data = [
    { id: 1, name: "Area", value: "19.5 acres", icon: areaIcon },
    { id: 2, name: "Location", value: "Kongara kalan", icon: locationIcon },
    { id: 3, name: "Type", value: "4BHK Villas", icon: typeIcon },
    { id: 4, name: "Total villas", value: "163", icon: totalVillasIcon },
    { id: 5, name: "Plot area", value: "292-351 Sq. Yds", icon: plotAreaIcon },
    { id: 6, name: "Villa area", value: "3,807-4,927 Sft", icon: villaAreaIcon },
    { id: 7, name: "Structure", value: "G+2", icon: structureIcon },
    { id: 8, name: "Clubhouse", value: "30,000 Sft", icon: clubhouseIcon }
  ];

  return (
    <div className="py-3 py-md-5 villa-specs" id="villa-specs">
      <div className="container">
        <div className="px-3">
        <div className="villa-specs-title title-container" >
          <h2 className="mb-0 Title">Villa Specifications</h2>
        </div>

        <div className="row align-items-start gap-3 gap-lg-0">
          <div className="col-lg-7 d-flex flex-column gap-3">
            <h3 className="fw-bold mb-0 Heading">
              {isMobile ? <>
                Designed for Comfort, <br />Built with Intention</> : <>
                4BHK Gated Villa  <br />Community in Adibatla</>}
            </h3>
            {isMobile ? null : <p className=" villadesc">
              Searching for 4 BHK villas for sale in Hyderabad that feel spacious and soulful? Look no further.
            </p>}

            <div className="row gx-2 gx-lg-4 gy-2 gy-lg-4 mb-2 mb-lg-0 ">
              {data.map((item) => (
                <div key={item.id} className="col-6">
                  <div className="d-flex align-items-center p-1 p-md-3 villacont">
                    <Image
                      src={item.icon}
                      alt={`${item.name} icon`}
                      className="me-3 villaicon"
                    />
                    <div>
                      <h6 className="mb-1 villaspecshead">{item.name}</h6>
                      <p className="mb-0 villaspecdetail">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="col-lg-5 position-relative d-flex flex-column align-items-center justify-content-center gap-2 ">
            <Image
              src={isMobile ? mvilla : villa}
              alt="Villa Image"
              className="img-fluid rounded w-100 "
              style={{ objectFit: "contain" }}
              priority
            />
            <Image
              src={isMobile ? mvill2 : villa2}
              alt="Villa Image"
              className="img-fluid rounded w-100"
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </div>
        </div>
      </div>

    </div>
  );
}
