import Image from "next/image";
// import image1 from "../assets/c3.webp";
// import image1mv from "../assets/c3mv.webp";
// import image2 from "../assets/mask1.webp";
import { useMediaQuery } from "react-responsive";
export default function Component3() {

  const isMobile = useMediaQuery({ query: "(max-width: 991px)" });
  const issmMobile = useMediaQuery({ query: "(max-width: 500px)" });
  return (
    // <div className="d-flex align-items-center justify-content-center">
    <div
      className="py-5 d-flex flex-column align-items-center justify-content-center w-100"
      style={{
        backgroundImage: `url(${image2.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center bottom ',
        backgroundSize: 'contain',
        backgroundColor: 'white',
        // maxWidth: 1500,
      }}
    >
      <div className="container" >
        <div className="px-3" >
          <div className="title-container c3-tittle mb-2">
            <h2 className="mb-0 Title">Welcome to Urban Ranch</h2>
          </div>

          <div className="align-items-center gx-5">
            <div className="col-md-12">
              <h3 className="fw-bold mb-3 Heading">Ranch Life = Refined Living</h3>
              <p className="c3-p">
                {isMobile ? <>
                  Welcome to IRA Urban Ranch — Set in Kongarakalan, near Adibatla, this 17-acre gated villa community is crafted for families seeking luxury, privacy, and soul-deep connection.</> :
                  <>Welcome to IRA Urban Ranch — Set in Kongarakalan, near Adibatla, this 17-acre gated villa <br />community is crafted for families seeking luxury, privacy, and soul-deep connection.</>
                }
              </p>
            </div>
            <div className="col-md-12 d-flex justify-content-center align-items-center align-self-center">
              <Image
                src={isMobile ? image1mv : image1}
                alt="Image"
                className="img-fluid rounded w-100"
                priority
              />
            </div>
          </div>
        </div>


      </div>
    </div>
    // </div>

  );
}
