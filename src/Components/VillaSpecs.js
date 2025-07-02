import Image from "next/image";
import villa from "../assets/c7.webp";
import mvilla from "../assets/urmobile/vsmobile.webp";
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
    { id: 1, name: "Area", value: "17 acres", icon: areaIcon },
    { id: 2, name: "Location", value: "Kongarakalan", icon: locationIcon },
    { id: 3, name: "Type", value: "4BHK Villas", icon: typeIcon },
    { id: 4, name: "Total villas", value: "163", icon: totalVillasIcon },
    { id: 5, name: "Plot area", value: "298-351 Sq. Yds", icon: plotAreaIcon },
    { id: 6, name: "Villa area", value: "3,718-4,711 Sq. Ft", icon: villaAreaIcon },
    { id: 7, name: "Structure", value: "G+2", icon: structureIcon },
    { id: 8, name: "Clubhouse", value: "20500 SFT", icon: clubhouseIcon }
  ];

  return (
    <div className="py-3 py-md-5 villa-specs" id="villa-specs">
      <div className="container">
        <div>
        <div className="villa-specs-title title-container" >
          <h2 className="mb-0 Title">Villa Specifications</h2>
        </div>

        <div className="row align-items-start gap-3 gap-lg-0">
          <div className="col-lg-7 d-flex flex-column gap-3">
            <h3 className="fw-bold mb-0 Heading">
              {isMobile ? <>
                Designed for Comfort, <br />Built with Intention</> : <>
                Designed for Comfort, Built <br />with Intention</>}
            </h3>
            {isMobile ? null : <p className=" villadesc">
              Searching for 4 BHK villas for sale in Hyderabad that feel spacious and soulful? Look no further.
            </p>}

            <div className="row gx-2 gx-md-3 gy-2 gy-md-3 mb-2 ">
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

          <div className="col-lg-5 position-relative d-flex align-items-center justify-content-center ">
            <Image
              src={isMobile ? mvilla : villa}
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
