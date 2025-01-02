import { Container, Row, Col, Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';

// Image URLs
const images = [
    'https://i.pinimg.com/236x/7f/93/3c/7f933cd6388df474902514f446d5b8a8.jpg',
    'https://cdn.shopify.com/s/files/1/0625/3818/6989/files/1_c9b5f45f-2c05-48cd-b8ce-9b151dc252f9.jpg?v=1676784144',
    'https://5.imimg.com/data5/ANDROID/Default/2022/6/XE/DZ/WE/124730190/product-jpeg-500x500.jpg',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC7m4qxbmdaU5sx2C-Cfar-28DrwnJpQQ-wQ&s',
    'https://rukminim2.flixcart.com/image/850/1000/jy7kyvk0/painting/h/2/g/p0670-paf-original-imafhnggafz8fcrd.jpeg?q=90&crop=false',
    'https://images.saatchiart.com/saatchi/298693/art/12137819/11200017-ESAXKDTA-6.jpg',
];

export default function Example() {
    const [currentImages, setCurrentImages] = useState(images);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImages((prevImages) => {
                const updatedImages = [...prevImages];
                updatedImages.push(updatedImages.shift()!); // Rotate images
                return updatedImages;
            });
        }, 3000); // Transition every 3 seconds (reduced)

        return () => clearInterval(interval);
    }, []);

    return (
        <section id="home" className="bg-white overflow-hidden py-5 hero-section">
            <Container>
                <Row className="align-items-center">
                    {/* Left Section */}
                    <Col lg={6} className="text-center text-lg-start mb-5 mb-lg-0">
                        <h1 className="display-3 fw-bold text-dark mb-4">Summer styles are finally here</h1>
                        <p className="fs-5 text-muted mb-4">
                            This year, our new summer collection will shelter you from the harsh elements of a world
                            that doesn't care if you live or die.
                        </p>
                        {/* <Button variant="primary" size="lg" className="px-4">
                            Shop Collection
                        </Button> */}
                    </Col>

                    {/* Right Section: Faster Swapping Image Grid */}
                    {/* <Col lg={6} className="d-flex justify-content-lg-end justify-content-center position-relative">
                        <div className="d-flex gap-3">
                            <div className="d-flex flex-column gap-3">
                                <img src={currentImages[0]} alt="Image 1" className="rounded image-transition" />
                                <img src={currentImages[1]} alt="Image 2" className="rounded image-transition" />
                            </div>

                            <div className="d-flex flex-column gap-3 mt-5">
                                <img src={currentImages[2]} alt="Image 3" className="rounded image-transition" />
                                <img src={currentImages[3]} alt="Image 4" className="rounded image-transition" />
                            </div>

                            <div className="d-flex flex-column gap-3">
                                <img src={currentImages[4]} alt="Image 5" className="rounded image-transition" />
                                <img src={currentImages[5]} alt="Image 6" className="rounded image-transition" />
                            </div>
                        </div>
                    </Col> */}
                    <Col
                        lg={6}
                        className="d-flex justify-content-lg-end justify-content-center position-relative overflow-hidden"
                        style={{ maxHeight: '100%' }}>
                        <div className="d-flex gap-3 justify-content-center" style={{ overflow: 'hidden' }}>
                            {/* Column 1 */}
                            <div className="d-flex flex-column gap-3">
                                <img
                                    src={currentImages[0]}
                                    alt="Image 1"
                                    className="rounded image-transition"
                                />
                                <img
                                    src={currentImages[1]}
                                    alt="Image 2"
                                    className="rounded image-transition"
                                />
                            </div>

                            {/* Column 2 */}
                            <div className="d-flex flex-column gap-3 mt-5">
                                <img
                                    src={currentImages[2]}
                                    alt="Image 3"
                                    className="rounded image-transition"
                                />
                                <img
                                    src={currentImages[3]}
                                    alt="Image 4"
                                    className="rounded image-transition"
                                />
                            </div>

                            {/* Column 3 */}
                            <div className="d-flex flex-column gap-3">
                                <img
                                    src={currentImages[4]}
                                    alt="Image 5"
                                    className="rounded image-transition"
                                />
                                <img
                                    src={currentImages[5]}
                                    alt="Image 6"
                                    className="rounded image-transition"
                                    
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Global CSS */}
            <style>{`
                .image-transition {
                    height: 250px;
                    width: 180px;
                    object-fit: cover;
                    transition: opacity 1s ease-in-out, transform 1s ease-in-out; /* Reduced duration */
                    opacity: 0.9;
                }

                .image-transition:hover {
                    transform: scale(1.03); /* Slight zoom effect on hover */
                    opacity: 1;
                }

                /* Media Query for smaller screens */
  @media (max-width: 992px) {
    .hero-section {
      padding-top: 12em!important;
    }
            }
            `}</style>
        </section>
    );
}
