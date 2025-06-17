import Image from "next/image";
import img1 from "../assets/gallery/c4.png";
import img2 from "../assets/gallery/C8.png";
import img3 from "../assets/gallery/image5.png";
import img4 from "../assets/gallery/c7.png";
import img5 from "../assets/gallery/c2.png";
import img1mv from "../assets/gallery/c4mv.png";
import img2mv from "../assets/gallery/C8mv.png";
import img3mv from "../assets/gallery/image5mv.png";
import img4mv from "../assets/gallery/c7mv.png";
import img5mv from "../assets/gallery/c2mv.png";
import img6 from "../assets/Vector.png";
import { useMediaQuery } from "react-responsive";

export default function Gallery() {
  const isMobile = useMediaQuery({ query: "(max-width: 750px)" });

  return (
    <section className="py-5 position-relative" style={{ backgroundColor: "var(--gallerybg)" }}>
      <Image
          src={img6}
          alt="Decoration"
          width={isMobile ?121 :162}
          height={isMobile ?107 :145}
          className="position-absolute start-0"
          style={{bottom:isMobile?0:"20%", zIndex:0}}
        />
        <Image
          src={img6}
          alt="Decoration"
          width={isMobile ?121 :162}
          height={isMobile ?107 :145}
          className="position-absolute end-0"
          style={{top:isMobile?0:"20%"}}
        />
      <div className="container text-start " >
        

        <h3 className="mb-4 GalleryTitle" >Gallery</h3>

        {/* Decorative Icons */}

        
        {isMobile && <div className="container position-relative">
          {/* Row 1: 2 images side by side on all screen sizes */}
          <div className="row mb-3">
            <div className="col-6">
              <Image
                src={img1mv}
                alt="Gallery Image 1"
                className="w-100 rounded galleryimage"
                style={{zIndex:10}}
              />
            </div>
            <div className="col-6">
              <Image
                src={img2mv}
                alt="Gallery Image 2"
                className="w-100 rounded"
                style={{zIndex:10}}
              />
            </div>
          </div>

          {/* Row 2: 1 image full width */}
          <div className="row mb-3">
            <div className="col-12">
              <Image
                src={img3mv}
                alt="Gallery Image 3"
                className="w-100 rounded"
                style={{zIndex:10}}
              />
            </div>
          </div>

          {/* Row 3: 2 images side by side on all screen sizes */}
          <div className="row">
            <div className="col-6">
              <Image
                src={img4mv}
                alt="Gallery Image 4"
                className="w-100 rounded"
                style={{zIndex:10}}
              />
            </div>
            <div className="col-6">
              <Image
                src={img5mv}
                alt="Gallery Image 5"
                className="w-100 rounded"
              />
            </div>
          </div>
        </div>}


        {!isMobile && <div className="row">
          {/* First column: 2 stacked images */}
          <div className="col-md-4 d-flex flex-column gap-3">
            <Image
              src={img1}
              alt="Gallery Image 1"
              className="img-fluid rounded"
                style={{zIndex:10}}
            />
            <Image
              src={img2}
              alt="Gallery Image 2"
              className="img-fluid rounded"
                style={{zIndex:10}}
            />
          </div>

          {/* Second column: 1 image full height */}
          <div className="col-md-4 d-flex align-items-center">
            <Image
              src={img3}
              alt="Gallery Image 3"
              className="img-fluid rounded w-100"
                style={{zIndex:10}}
            />
          </div>

          {/* Third column: 2 stacked images */}
          <div className="col-md-4 d-flex flex-column gap-3">
            <Image
              src={img4}
              alt="Gallery Image 4"
              className="img-fluid rounded"
                style={{zIndex:10}}
            />
            <Image
              src={img5}
              alt="Gallery Image 5"
              className="img-fluid rounded"
                style={{zIndex:10}}
            />
          </div>
        </div>}

      </div>
    </section>
  );
}
