import Image from "next/image";
import villa from "../assets/c7.webp";
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
    <div className="container py-5" id="villa-specs">
      <h2 className="text-start mb-4 Title">Villa Specifications</h2>

      <div className="row align-items-start gap-3 gap-lg-0">
        <div className="col-lg-7 d-flex flex-column gap-3">
          <h3 className="fw-bold mb-3 Heading">
            Designed for Comfort, Built <br />with Intention
          </h3>
         {isMobile? null : <p className=" villadesc">
            Searching for 4 BHK villas for sale in Hyderabad that feel spacious and soulful? Look no further.
          </p>}

          <div className="row gx-3 gy-4">
  {data.map((item) => (
    <div key={item.id} className="col-6">
      <div className="d-flex align-items-center p-3 villacont">
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
            src={villa}
            alt="Villa Image"
            className="img-fluid rounded"
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>
    </div>
  );
}
