import Image from "next/image";
import masterPlanImage from "../assets/UrImages/desktop/mp.webp";
import masterPlanmbImage from "../assets/UrImages/mobile/mp.webp";
import { useMediaQuery } from 'react-responsive';
import { useMemo } from "react";
import { openStartupModal } from "./formpopup";

export default function MasterPlan() {
  const legendItems = [
    "Entry/exit with security cabin",
    "Primary street",
    "Pedestrian walkway",
    "Multipurpose lawn with stepped sitting",
    "Stage with feature wall",
    "Sunken seating with fire pit",
    "Swimming pool",
    "Shade structure and lounge seating",
    "Car parking",
    "Driveway",
    "Plaza",
    "Children's play area",
    "Mini soccer",
    "Outdoor gym",
    "Picnic Zone",
    "Shade structure with yoga/meditation",
    "Play lawn",
    "Half basketball court with seating gallery",
    "Tennis court",
    "Feature wall with sculpture",
    "Skating rink",
    "Informal seating",
    "Edible garden",
  ];

  const isMobile = useMediaQuery({ query: '(max-width: 991px)' });
  const COLUMN_COUNT = isMobile ? 2 : 3;

  const columns = useMemo(() => {
    const rows = Math.ceil(legendItems.length / COLUMN_COUNT);
    const cols = Array.from({ length: COLUMN_COUNT }, () => []);

    for (let i = 0; i < legendItems.length; i++) {
      const colIndex = Math.floor(i / rows);
      cols[colIndex].push({ index: i + 1, item: legendItems[i] });
    }

    return cols;
  }, [legendItems, isMobile]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = 'UR_MiniBrochure.pdf';
    link.download = 'UR_MiniBrochure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className=" pt-3 pt-lg-5 pb-3" style={{ backgroundColor: "var(--mpbgclr)" }}>
    <div className="container px-3">
      <div className="d-flex justify-content-between">
                <h3 className="mb-3 fw-bold Heading">Master Plan</h3>
                {!isMobile && (
                  <button className="mpbroucherbtn mb-5" onClick={openStartupModal}>
                    Download Brochure
                  </button>
                )}
                
              </div>
    </div>
    <div>
      <div className={isMobile ? "container":"d-flex align-items-center justify-content-center"}>
                  <Image
                    src={isMobile ? masterPlanmbImage : masterPlanImage}
                    alt="Master plan image"
                    className="img-fluid align-self-center w-100"
                    priority
                  />
                </div>
    </div>
    <div className="container px-3">
      <div className="d-flex justify-content-center">
              <div className="bg-light p-4 " style={{ borderRadius: 10, }}>
                <h3 className="mb-4 fw-bold Heading">Legend</h3>

                <div className="row">
                  {columns.map((col, colIndex) => (
                    <div key={colIndex} className="col-6 col-lg-4">
                      {col.map(({ index, item }) => (
                        <div
                          key={index}
                          className="mb-2 d-flex align-items-start"
                          style={{ fontSize: isMobile ? "10px" : "16px" }}
                        >
                          <span className="me-2">{index}.</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {isMobile && (
            <button className="mpbroucherbtn" onClick={openStartupModal}>
              Download Brochure
            </button>
          )}
    </div>
      
    </div>
  );
}
