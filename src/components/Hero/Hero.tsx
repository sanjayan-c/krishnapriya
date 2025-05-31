// src/components/Hero/HeroImagesRow.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import img1 from '../../assets/images/photos/hero/1.jpg';
import img2 from '../../assets/images/photos/hero/2.jpg';
import img3 from '../../assets/images/photos/hero/3.jpg';
import img4 from '../../assets/images/photos/hero/4.jpg';
import img5 from '../../assets/images/photos/hero/5.jpg';
import img6 from '../../assets/images/photos/hero/6.jpg';
import img7 from '../../assets/images/photos/hero/7.jpg';
import img8 from '../../assets/images/photos/hero/8.jpg';
import img9 from '../../assets/images/photos/hero/9.jpg';
import img10 from '../../assets/images/photos/hero/10.jpg';

// Full array of ten images
const IMAGES = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

export default function Example() {
    // State for rotating the array
    const [currentImages, setCurrentImages] = useState<string[]>(IMAGES);
    // How many images to show in one row
    const [visibleCount, setVisibleCount] = useState<number>(10);

    // Function to update visibleCount based on window.innerWidth
    const updateVisibleCount = useCallback(() => {
        const w = window.innerWidth;
        if (w >= 1200) {
            setVisibleCount(9);
        } else if (w >= 992) {
            setVisibleCount(7);
        } else if (w >= 768) {
            setVisibleCount(5);
        } else if (w >= 576) {
            setVisibleCount(5);
        } else {
            setVisibleCount(3);
        }
    }, []);

    // On mount, set initial visibleCount and listen for resize
    useEffect(() => {
        updateVisibleCount();
        window.addEventListener('resize', updateVisibleCount);
        return () => {
            window.removeEventListener('resize', updateVisibleCount);
        };
    }, [updateVisibleCount]);

    // Rotate the entire array every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImages((prev) => {
                const updated = [...prev];
                updated.push(updated.shift()!); // take the first element to the end
                return updated;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Only render the first `visibleCount` images in the row
    const imagesToShow = currentImages.slice(0, visibleCount);

    return (
        <section id="home" className="overflow-hidden py-5 hero-section" style={{ backgroundColor: '#5B002D' }}>
            <Container fluid>
                <Row className="justify-content-center">
                    <Col xs={12}>
                        <div
                            className="d-flex justify-content-center align-items-center flex-nowrap"
                            style={{
                                gap: '1rem',
                                overflow: 'hidden',
                                padding: '1rem 0',
                            }}>
                            {imagesToShow.map((src, idx) => (
                                <div
                                    key={idx}
                                    className="image-container"
                                    style={{
                                        // Calculate width so that `visibleCount` images fill 100% (minus gaps)
                                        flex: `0 0 calc((100% - ${(visibleCount - 1) * 1}rem) / ${visibleCount})`,
                                        // Stagger every other image by pushing it down 50px
                                        marginTop: idx % 2 === 1 ? '25px' : '0',
                                    }}>
                                    <Link to="/gallery">
                                        <img
                                            src={src}
                                            alt={`Hero ${idx + 1}`}
                                            className="rounded image-transition"
                                            style={{
                                                width: '100%',
                                                height: '250px',
                                                objectFit: 'cover',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* Hover/transition CSS (unchanged) */}
            <style>{`
        .image-transition {
          transition: opacity 1s ease-in-out, transform 1s ease-in-out;
          opacity: 0.9;
        }
        .image-transition:hover {
          transform: scale(1.05);
          opacity: 1;
        }
        @media (max-width: 992px) {
          .hero-section {
            padding-top: 8em !important;
          }
        }
      `}</style>
        </section>
    );
}

// import React from 'react';
// import desktopBanner from '../../assets/images/photos/desktop_banner2.png';
// import mobileBanner  from '../../assets/images/photos/mobile_banner2.png';

// export default function Hero() {
//   return (
//     <section id="home" className="hero-section p-0">
//       {/* Desktop image: hidden below lg */}
//       <div className="d-none d-md-block">
//         <img
//           src={desktopBanner}
//           alt="Banner featuring Krishna Priya's artwork"
//           className="img-fluid w-100"
//         />
//       </div>

//       {/* Mobile image: shown below lg */}
//       <div className="d-block d-md-none">
//         <img
//           src={mobileBanner}
//           alt="Banner featuring Krishna Priya's artwork"
//           className="img-fluid w-100"
//         />
//       </div>

//       <style>{`
//         .hero-section {
//           position: relative;
//           overflow: hidden;
//         }
//       `}</style>
//     </section>
//   );
// }
