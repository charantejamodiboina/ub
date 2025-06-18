import Image from "next/image";
import masterPlanImage from "../assets/plan.png";
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
        <section className="mp" style={{ backgroundColor: "var(--mpbgclr)" }}>
            <div className="row g-5 align-items-center ">
                {/* Left Column: Master Plan */}
                <div className="col-lg-7 d-flex flex-column align-items-end">
                    <div>
                        <h3 className="mb-3 fw-bold Heading">Master Plan</h3>
                        {!isMobile ? < button className=" mpbroucherbtn" >Download Brochure</button> : null}
                        <div className="">
                            <Image
                                src={masterPlanImage}
                                alt="Master plan image"
                                className="img-fluid "
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
                                <span className="fw-semibold me-2">{index + 1}.</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {isMobile ? <button className=" mpbroucherbtn" >Download Brochure</button> : null}
        </section>
    );
}
