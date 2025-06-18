import Image from "next/image";
import image1 from "../assets/c3.png";
import image2 from "../assets/mask1.png";

export default function Component3() {
  return (
    <div
      className="py-5 d-flex flex-column align-items-center bg-light"
      style={{
        backgroundImage: `url(${image2.src})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center bottom ',
        backgroundSize: 'contain',
      }}
    >
      <div className="" style={{ maxWidth: '86%' }}>
        <h2 className="mb-4 Title">Welcome to Urban Ranch</h2>

        <div className="align-items-center gx-5">
          <div className="col-md-12">
            <h3 className="fw-bold mb-3 Heading">Ranch Life = Refined Living</h3>
            <p className="c3-p">
              Welcome to IRA Urban Ranch — Set in Kongarakalan, near Adibatla, this 17-acre gated villa community is
              crafted for families seeking luxury, privacy, and soul-deep connection.
            </p>
          </div>
          <div className="col-md-12">
            <Image
              src={image1}
              alt="Image"
              className="img-fluid rounded"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
