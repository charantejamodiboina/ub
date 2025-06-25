import { useMediaQuery } from "react-responsive";

export default function CustomerTestimonials() {
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const data = [
        {
            id: 1,
            customer_name: "Priya & Arjun",
            customer_occupation: "NRI Investors",
            customer_voice: "Felt Right Instantly",
            customer_voice2:
                "We moved from overseas and found not just a home, but a community. Our kids have friends. We have peace.",
            color: "#7CBB00",
        },
        {
            id: 2,
            customer_name: "Kiran Reddy",
            customer_occupation: "Tech Entrepreneur",
            customer_voice: "Perfect Blend of Life",
            customer_voice2:
                "Urban Ranch was love at first sight. Where else do you find the luxury of a serene green space close to Abibatla TCS?",
            color: "#F79F24",
        },
        {
            id: 3,
            customer_name: "Meera & Sanjay",
            customer_occupation: "Business Owners",
            customer_voice: "Luxury with a Heart",
            customer_voice2:
                "A combination of a sleek design and rooted lifestyle was what we were looking for. Urban Ranch gave us that exactly!",
            color: "#00A1F1",
        },
    ];

    const getInitials = (fullName) => {
        const words = fullName.split(" ");
        const initials = words
            .filter((word) => word[0]?.toUpperCase() !== "&")
            .map((word) => word[0]?.toUpperCase())
            .join("");
        return initials.slice(0, 2);
    };

    return (
        <div className="container py-4 px-4 py-md-5" >
            <p className="fw-semibold Title">Customer Testimonials</p>
            {isMobile ?<h1 className="fw-bold mb-3 Heading">Built with Heart.<br/> Backed by Trust.</h1> :<h1 className="fw-bold mb-3 Heading">Built with Heart. Backed by Trust.</h1>}
            <div className="row g-4">
                {data.map((item) => (
                    <div key={item.id} className="col-6 col-md-4 ">
                        <div className="border rounded-2 h-100 rounded-md-4 p-2 p-md-4 d-flex flex-column justify-content-between shadow-sm ">
                            <div>
                                <h3 className="h5 fw-semibold mb-1 mb-md-3" style={{fontSize: isMobile? 10: 24}}>{item.customer_voice}</h3>
                                <p className="text-secondary" style={{fontSize: isMobile? 8: 18}}>{item.customer_voice2}</p>
                            </div>
                            <div className="d-flex align-items-center mt-2 mt-md-4">
                                <div>
                                    <div
                                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{
                                        backgroundColor: item.color,
                                        width: isMobile?"25.5px":"51px",
                                        height: isMobile?"25.5px":"51px",
                                        fontSize: isMobile?"9px":"18px",
                                        fontWeight: "600",
                                        color: "white",
                                    }}
                                >
                                    {getInitials(item.customer_name)}
                                </div>
                                </div>
                                
                                <div>
                                    <p className="mb-0 fw-semibold" style={{fontSize: isMobile? 8: 18}}>{item.customer_name}</p>
                                    <p className="mb-0 text-muted small" style={{fontSize: isMobile? 8: 18}}>{item.customer_occupation}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
