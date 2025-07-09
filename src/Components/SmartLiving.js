import fan from "../assets/smarticons/fan.png";
import lock from "../assets/smarticons/smartlock.png";
import voice from "../assets/smarticons/voice_assistant.png";
import remote from "../assets/smarticons/remote_access.png";
import wiring from "../assets/smarticons/wiring.png";
import smartimage from "../assets/C4_Westfacingwithclub.webp";
import msmartimage from "../assets/slmbimg.webp";
import Image from "next/image";
import "./style.module.css"
import { useMediaQuery } from 'react-responsive';
export default function SmartLiving() {
  const isMobile = useMediaQuery({ query: '(max-width: 991px)' });
  const issmMobile = useMediaQuery({ query: '(max-width: 450px)' });
  const data = [
    { id: 1, name: "App-Controlled Lighting <br> & Fan Automation", icon: fan, width: 48.18, height: 42, mbwidth: 24.09, mbheight: 21 },
    { id: 2, name: "Smart Door Locks <br> & Entry Alerts", icon: lock, width: 32.2, height: 42, mbwidth: 16.1, mbheight: 21 },
    { id: 3, name: "Voice Assistant Compatibility <br> (Alexa/Google)", icon: voice, width: 30, height: 50.28, mbwidth: 15, mbheight: 25.14 },
    { id: 4, name: "Remote-Access for <br> Appliances & Devices", icon: remote, width: 42.01, height: 42, mbwidth: 21, mbheight: 21 },
    { id: 5, name: "Future-Ready Automation <br> Wiring Throughout", icon: wiring, width: 42, height: 42, mbwidth: 21, mbheight: 21 },
  ];

  return (
    <div className="py-4 bg-white" id="smart-living">
      <div className="container text-center">
        <div className="px-3">
        <h5 className="mb-3 fw-bold text-start Heading">Smart Living, Without Lifting A Finger</h5>
        <p className="mb-0 pb-md-4 text-start smartliving_p" > {!isMobile ? <>
        Your villa at IRA Urban Ranch comes fully pre-fitted with complete home automation -<br className="d-none d-md-block" /> 
          designed to make everyday life smoother, safer, and more intuitive for your family.</> : <>Your villa at <b>IRA Urban Ranch comes</b> fully pre-fitted with <b>complete home automation</b> -<br className="d-none d-md-block" />
          designed to make everyday life smoother, safer, and more intuitive for your family.</>}
          
        </p>

        <div className="row align-items-center ">
          {/* Icons List */}
          <div className="col-lg-5">
            <div className="row row-col-1 g-4 text-start my-3 ">
              {data.map((item) => (
                <div className= {isMobile ? "col-6 col-lg-12 mt-0 " :"col-6 col-lg-12 d-flex align-items-lg-center align-items-start flex-md-row flex-column smartliving_icon_container mb-4 my-md-0 my-lg-3 "} key={item.id}>
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

                  <p className="mb-0 me-1 py-2 smartliving_icon_name" dangerouslySetInnerHTML={{ __html: item.name }}/>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Living Image */}
          <div className="col-lg-7 text-center">
            <Image
              src={isMobile ? msmartimage : smartimage}
              alt="Smart Living"
              className="img-fluid rounded shadow w-100"
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
