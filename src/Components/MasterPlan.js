import Image from "next/image";
import masterPlanImage from "../assets/urdesktop/mpdesktop.webp";
import masterPlanmbImage from "../assets/urmobile/mpmobile.webp";
import { useMediaQuery } from 'react-responsive';
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

    return (
        <section className="mp px-4 px-lg-5" style={{ backgroundColor: "var(--mpbgclr)" }}>
            <div className="container py-2">
            <div className="row g-5 align-items-start ">
                {/* Left Column: Master Plan */}
                <div className="col-lg-7 d-flex flex-column ">
                    <div>
                        <h3 className="mb-3 fw-bold Heading">Master Plan</h3>
                        {!isMobile ? < button className=" mpbroucherbtn mb-5" >Download Brochure</button> : null}
                        <div className="d-flex align-items-center justify-content-center">
                            <Image
                                src={isMobile ? masterPlanmbImage :masterPlanImage}
                                alt="Master plan image"
                                className="img-fluid align-self-center"
                                priority
                            />
                        </div>
                    </div>


                </div>

                {/* Right Column: Legend */}
                <div className="col-lg-5 rounded-4 py-3" style={{ backgroundColor: "white" }}>
                    <h3 className="mb-4 fw-bold Heading">Legend</h3>
                    <ul className="list-unstyled row">
                        {legendItems.map((item, index) => (
                            <li
                                key={index}
                                className="col-6 col-lg-12 d-flex align-items-start"
                                style={{ fontSize: isMobile ? "10px" : "18px" }}
                            >
                                <span className="me-2">{index + 1}.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {isMobile ? <button className=" mpbroucherbtn" >Download Brochure</button> : null}
            </div>
        </section>
    );
}
