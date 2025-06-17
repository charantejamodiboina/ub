import fan from "../assets/smarticons/fan.png";
import lock from "../assets/smarticons/smartlock.png";
import voice from "../assets/smarticons/voice_assistant.png";
import remote from "../assets/smarticons/remote_access.png";
import wiring from "../assets/smarticons/wiring.png";
import smartimage from "../assets/C4_Westfacingwithclub.png";
import Image from "next/image";
import "./style.module.css"
import { useMediaQuery } from 'react-responsive';
export default function SmartLiving() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const data = [
    { id: 1, name: "App-controlled lighting & fan automation", icon: fan, width: 48.18, height: 42, mbwidth: 24.09, mbheight: 21 },
    { id: 2, name: "Smart door locks & entry alerts", icon: lock, width: 32.2, height: 42, mbwidth: 16.1, mbheight: 21 },
    { id: 3, name: "Voice assistant compatibility (Alexa/Google)", icon: voice, width: 30, height: 50.28, mbwidth: 15, mbheight: 25.14 },
    { id: 4, name: "Remote-access for appliances & devices", icon: remote, width: 42.01, height: 42, mbwidth: 21, mbheight: 21 },
    { id: 5, name: "Future-ready automation wiring throughout", icon: wiring, width: 42, height: 42, mbwidth: 21, mbheight: 21 },
  ];

  return (
    <section className="py-5 bg-white" id="smart-living">
      <div className="container text-center">
        <h5 className="mb-3 fw-bold text-start Heading">Smart Living, Without Lifting a Finger</h5>
        <p className="mb-4 text-start smartliving_p" >
          Your villa at IRA Urban Ranch comes fully pre-fitted with complete home automation —<br className="d-none d-md-block" />
          designed to make everyday life smoother, safer, and more intuitive for your family.
        </p>

        <div className="row align-items-center gy-4">
          {/* Icons List */}
          <div className="col-lg-6">
            <div className="row row-cols-1 g-4 text-start ">
              {data.map((item) => (
                <div className="col-6 col-lg-12 d-flex align-items-center smartliving_icon_container" key={item.id}>
                  <div>
                    <div
                      className="me-3 align-items-center smartliving_icon"
                    >
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={isMobile ? item.mbwidth : item.width}
                        height={isMobile ? item.mbheight : item.height}
                        objectFit="contain"
                      />
                    </div>
                  </div>

                  <p className="mb-0 me-1 p-2 align-self-center smartliving_icon_name">{item.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Living Image */}
          <div className="col-lg-6 text-center">
            <Image
              src={smartimage}
              alt="Smart Living"
              className="img-fluid rounded shadow"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
