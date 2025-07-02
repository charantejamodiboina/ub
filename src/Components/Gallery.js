import Image from "next/image";
import img1 from "../assets/gallery/c4.webp";
import img2 from "../assets/gallery/C8.webp";
import img3 from "../assets/gallery/image5.webp";
import img4 from "../assets/gallery/c7.webp";
import img5 from "../assets/gallery/c2.webp";
import img1mv from "../assets/gallery/c4mv.webp";
import img2mv from "../assets/gallery/C8mv.webp";
import img3mv from "../assets/gallery/image5mv.webp";
import img4mv from "../assets/gallery/c7mv.webp";
import img5mv from "../assets/gallery/c2mv.webp";
import img6 from "../assets/Vector.webp";
import img6mv from "../assets/gallery/Vector.webp";
import { useMediaQuery } from "react-responsive";

export default function Gallery() {
  const isMobile = useMediaQuery({ query: "(max-width: 991px)" });

  return (
    <div className="py-5  position-relative" style={{ backgroundColor: "var(--gallerybg)" }}>
      <Image
        src={isMobile ? img6mv : img6}
        alt="Decoration"
        className="position-absolute start-0 img-fluid"
        style={{ bottom: isMobile ? 0 : "22%", zIndex: 0 }}
      />
      <Image
        src={isMobile ? img6mv : img6}
        alt="Decoration"
        className="position-absolute end-0 img-fluid"
        style={{ top: isMobile ? 0 : "7%" }}
      />
      <div className="container " >
        <div className="px-3">

          <h3 className="mb-4 GalleryTitle ps-2 ps-lg-0" >Gallery</h3>

          {/* Decorative Icons */}


          {isMobile && (
            <div className="" style={{ position: "relative", zIndex: 10 }}>
              {/* Row 1: 2 side-by-side images */}
              <div className="row gx-2 gy-2 ">
                <div className="col-6" >
                  <Image
                    src={img1mv}
                    alt="Gallery Image 1"
                    className="img-fluid rounded w-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="col-6">
                  <Image
                    src={img2mv}
                    alt="Gallery Image 2"
                    className="img-fluid rounded w-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* Row 2: full width image */}
              <div className="row gx-2 gy-2 mt-1">
                <div className="col-12">
                  <Image
                    src={img3mv}
                    alt="Gallery Image 3"
                    className="img-fluid rounded w-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* Row 3: 2 side-by-side images */}
              <div className="row gx-2 gy-2 mt-1">
                <div className="col-6">
                  <Image
                    src={img4mv}
                    alt="Gallery Image 4"
                    className="img-fluid rounded w-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="col-6">
                  <Image
                    src={img5mv}
                    alt="Gallery Image 5"
                    className="img-fluid rounded w-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          )}



          {!isMobile && (
            <div className="row g-3 justify-content-center">
              {/* First column: 2 stacked images */}
              <div className="col-md-4 d-flex flex-column justify-content-end align-items-end" style={{ zIndex: 10 }}>
                <Image
                  src={img1}
                  alt="Gallery Image 1"
                  className="img-fluid w-100"
                  style={{ maxHeight: 391, objectFit: 'cover', borderRadius: 15 }}
                />
                <Image
                  src={img2}
                  alt="Gallery Image 2"
                  className="img-fluid w-100 mt-3"
                  style={{ maxHeight: 227, objectFit: 'cover', borderRadius: 15 }}
                />
              </div>

              {/* Second column: 1 image full height */}
              <div className="col-md-4 d-flex align-items-center justify-content-center">
                <Image
                  src={img3}
                  alt="Gallery Image 3"
                  className="img-fluid w-100"
                  style={{ maxHeight: 636, objectFit: 'cover', borderRadius: 15 }}
                />
              </div>

              {/* Third column: 2 stacked images */}
              <div className="col-md-4 d-flex flex-column justify-content-start" style={{ zIndex: 10 }}>
                <Image
                  src={img4}
                  alt="Gallery Image 4"
                  className="img-fluid w-100"
                  style={{ maxHeight: 347, objectFit: 'cover', borderRadius: 15 }}
                />
                <Image
                  src={img5}
                  alt="Gallery Image 5"
                  className="img-fluid w-100 mt-4 rounded"
                  style={{ maxHeight: 263, objectFit: 'cover', borderRadius: 15 }}
                />
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
