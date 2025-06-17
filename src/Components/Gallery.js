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
      <div className="container " >
        

        <h3 className="mb-4 GalleryTitle" >Gallery</h3>

        {/* Decorative Icons */}

        
       {isMobile && (
  <div className="container-fluid px-2"  style={{position:"relative", zIndex:10}}>
    {/* Row 1: 2 side-by-side images */}
    <div className="row gx-2 gy-2">
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
    <div className="col-md-4 d-flex flex-column justify-content-end align-items-end" style={{zIndex:10}}>
      <Image
        src={img1}
        alt="Gallery Image 1"
        className="img-fluid w-100"
        style={{ maxHeight: 391, objectFit: 'cover', borderRadius:15 }}
      />
      <Image
        src={img2}
        alt="Gallery Image 2"
        className="img-fluid w-100 mt-3"
        style={{ maxHeight: 227, objectFit: 'cover', borderRadius:15 }}
      />
    </div>

    {/* Second column: 1 image full height */}
    <div className="col-md-4 d-flex align-items-center justify-content-center">
      <Image
        src={img3}
        alt="Gallery Image 3"
        className="img-fluid w-100"
        style={{ maxHeight: 636, objectFit: 'cover', borderRadius:15 }}
      />
    </div>

    {/* Third column: 2 stacked images */}
    <div className="col-md-4 d-flex flex-column justify-content-start"style={{zIndex:10}}>
      <Image
        src={img4}
        alt="Gallery Image 4"
        className="img-fluid w-100"
        style={{ maxHeight: 347, objectFit: 'cover', borderRadius:15 }}
      />
      <Image
        src={img5}
        alt="Gallery Image 5"
        className="img-fluid w-100 mt-4 rounded"
        style={{ maxHeight: 263, objectFit: 'cover', borderRadius:15 }}
      />
    </div>
  </div>
)}


      </div>
    </section>
  );
}
