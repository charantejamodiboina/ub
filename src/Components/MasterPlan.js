import Image from "next/image";
import masterPlanImage from "../assets/urdesktop/mpdesktop.webp";
import masterPlanmbImage from "../assets/urmobile/mpmobile.webp";
import { useMediaQuery } from 'react-responsive';
// import brochure from '../assets/UR_MiniBrochure.pdf'
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

  const isMobile = useMediaQuery({ query: '(max-width: 756px)' });

  // Compute number of rows (half of the items rounded up)
  const half = Math.ceil(legendItems.length / 2);
const handleDownload = () => {
    const link = document.createElement('a');
    link.href = 'UR_MiniBrochure.pdf'; // PDF path relative to `public` folder
    link.download = 'UR_MiniBrochure.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div style={{ backgroundColor: "var(--mpbgclr)" }}>
      <div className="container py-4">
        <div className="px-3">
          <div className="row g-5 align-items-start">
            {/* Left Column: Master Plan */}
            <div className="col-lg-7 d-flex flex-column">
              <div>
                <h3 className="mb-3 fw-bold Heading">Master Plan</h3>
                {!isMobile && (
                  <button className="mpbroucherbtn mb-5" onClick={handleDownload}>Download Brochure</button>
                )}
                <div className="d-flex align-items-center justify-content-center">
                  <Image
                    src={isMobile ? masterPlanmbImage : masterPlanImage}
                    alt="Master plan image"
                    className="img-fluid align-self-center w-100"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Legend */}
            <div className="col-12 col-lg-5 rounded-4 py-3 mt-2">
              <div className="bg-light p-4" style={{ borderRadius: 10 }}>
                <h3 className="mb-4 fw-bold Heading">Legend</h3>

                {/* Render 2-column format: i and i+half in same row */}
                <div className="row">
                  {Array.from({ length: half }).map((_, i) => (
                    <div className="row mb-2" key={i}>
                      <div className="col-6 d-flex align-items-start" style={{ fontSize: isMobile ? "10px" : "16px" }}>
                        {legendItems[i] && (
                          <>
                            <span className="me-2">{i + 1}.</span>
                            <span>{legendItems[i]}</span>
                          </>
                        )}
                      </div>
                      <div className="col-6 d-flex align-items-start" style={{ fontSize: isMobile ? "10px" : "16px" }}>
                        {legendItems[i + half] && (
                          <>
                            <span className="me-2">{i + 1 + half}.</span>
                            <span>{legendItems[i + half]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {isMobile && <button className="mpbroucherbtn" onClick={handleDownload}>Download Brochure</button>}
        </div>
      </div>
    </div>
  );
}
