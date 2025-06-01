// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Card, Col, Row } from 'react-bootstrap';
// import classNames from 'classnames';
// import FeatherIcon from 'feather-icons-react';
// import axios from 'axios';

// import { LightBox, ImageType } from 'components/LightBox';
// import { GalleryItem } from './types';

// type GalleryProps = {
//     galleryItems?: GalleryItem[];
// };

// const Gallery = ({ galleryItems = [] }: GalleryProps) => {
//     const [gallery, setGallery] = useState<GalleryItem[]>(galleryItems);
//     const [category, setCategory] = useState<string>('all');
//     const [galleryImages, setGalleryImages] = useState<ImageType[]>(galleryItems.map((album) => album.image));
//     const [isOpen, setIsOpen] = useState<boolean>(false);
//     const [photoIndex, setPhotoIndex] = useState<number>(0);

//     // Fetch gallery items on mount
//     useEffect(() => {
//         const fetchGalleryItems = async () => {
//             try {
//                 const response = await axios.get('http://localhost:8070/api/galleries');
//                 let fetchedGalleryItems = response.data;
//                 fetchedGalleryItems = fetchedGalleryItems.slice(0, 3);

//                 setGallery(fetchedGalleryItems);
//                 setGalleryImages(
//                     fetchedGalleryItems.map((item: GalleryItem) => ({
//                         src: `data:image/png;base64,${item.image}`, // Add Base64 prefix
//                         caption: item.title || '', // Use the title as caption
//                     }))
//                 );
//             } catch (error) {
//                 console.error('Error fetching gallery items:', error);
//             }
//         };

//         fetchGalleryItems();
//     }, []); // Empty dependency array ensures this runs once on mount

//     // Filter images by category
//     const filterImages = (category: string) => {
//         setCategory(category);

//         const filteredGallery =
//             category === 'all' ? galleryItems : galleryItems.filter((album) => album.category?.includes(category));

//         setGallery(filteredGallery);
//         setGalleryImages(filteredGallery.map((album) => album.image));
//     };

//     // Handle lightbox events
//     const openLightbox = (index: number) => {
//         setPhotoIndex(index);
//         setIsOpen(true);
//     };

//     const closeLightbox = () => setIsOpen(false);

//     const moveNext = () => setPhotoIndex((prev) => (prev + 1) % galleryImages.length);

//     const movePrev = () => setPhotoIndex((prev) => (prev + galleryImages.length - 1) % galleryImages.length);

//     return (
//         <>
//             <Row className="grid-portfolio mt-5 justify-content-center">
//                 {gallery.map((galleryItem, index) => (
//                     <Col md={4} className={`filter-item ${category}`} key={index}>
//                         <Card className="card-portfolio-item shadow border">
//                             <div className="p-2">
//                                 <div className="card-zoom">
//                                     <Link
//                                         to="#"
//                                         className="image-popup"
//                                         title={galleryItem.image?.caption || ''}
//                                         onClick={() => openLightbox(index)}
//                                         style={{
//                                             textDecoration: 'none',
//                                             display: 'block',
//                                         }}>
//                                         <div className="ratio ratio-4x3">
//                                             <img
//                                                 src={`data:image/png;base64,${galleryItem.image}` || ''}
//                                                 alt={galleryItem.image?.caption || 'Gallery Image'}
//                                                 className="img-fluid fixed-image"
//                                             />
//                                         </div>
//                                     </Link>
//                                 </div>
//                             </div>
//                             <Card.Body>
//                                 <div className="mt-2">
//                                     <h5 className="mt-0">{galleryItem.title}</h5>
//                                     <p className="text-muted mb-1">{galleryItem.description}</p>
//                                 </div>
//                             </Card.Body>
//                         </Card>
//                     </Col>
//                 ))}
//             </Row>

//             <div className="text-center mt-5 pb-md-0">
//                 <Link to="/gallery" className="btn btn-primary">
//                     <FeatherIcon icon="refresh-ccw" className="icon-xxs me-2" />
//                     View More
//                 </Link>
//             </div>

//             {isOpen && (
//                 <LightBox
//                     images={galleryImages}
//                     photoIndex={photoIndex}
//                     closeLightbox={closeLightbox}
//                     moveNext={moveNext}
//                     movePrev={movePrev}
//                 />
//             )}
//         </>
//     );
// };

// export default Gallery;
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, Col, Row } from 'react-bootstrap';
import classNames from 'classnames';
import FeatherIcon from 'feather-icons-react';
import axios from 'axios';

import { LightBox, ImageType } from 'components/LightBox';
import { GalleryItem } from './types';
import Loading from '../Loading/index';

type GalleryProps = {
    galleryItems?: GalleryItem[];
};

const Gallery = () => {
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [category, setCategory] = useState<string>('all');
    const [galleryImages, setGalleryImages] = useState<ImageType[]>([]);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [photoIndex, setPhotoIndex] = useState<number>(0);
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set()); // Track expanded cards
    const [maxHeight, setMaxHeight] = useState<number>(0); // State to store the max height
    const cardBodiesRef = useRef<(HTMLDivElement | null)[]>([]); // Ref for storing card body elements
    const [loading, setLoading] = useState(true);

    // Fetch gallery items on mount
    useEffect(() => {
        const fetchGalleryItems = async () => {
            try {
                setLoading(true);
                const baseUrl = process.env.REACT_APP_BASE_URL;
                const response = await axios.get(`${baseUrl}/api/galleries`);
                let fetchedGalleryItems = response.data;
                fetchedGalleryItems = fetchedGalleryItems.slice(0, 3);

                setGallery(fetchedGalleryItems);
                setGalleryImages(
                    fetchedGalleryItems.map((item: GalleryItem) => ({
                        src: `data:image/png;base64,${item.image}`, // Add Base64 prefix
                        caption: item.title || '', // Use the title as caption
                    }))
                );
                setLoading(false);
            } catch (error) {
                console.error('Error fetching gallery items:', error);
                setLoading(false);
            }
        };

        fetchGalleryItems();
    }, []);

    // Handle dropdown toggle
    const toggleDescription = (index: number) => {
        setExpandedCards((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // Handle lightbox events
    const openLightbox = (index: number) => {
        setPhotoIndex(index);
        setIsOpen(true);
    };

    const closeLightbox = () => setIsOpen(false);

    const moveNext = () => setPhotoIndex((prev) => (prev + 1) % galleryImages.length);

    const movePrev = () => setPhotoIndex((prev) => (prev + galleryImages.length - 1) % galleryImages.length);

    // Calculate the max height of all card bodies after component mounts
    useEffect(() => {
        const updateMaxHeight = () => {
            if (window.innerWidth >= 768 && cardBodiesRef.current.length > 0) {
                const heights = cardBodiesRef.current.map((ref) => ref?.clientHeight || 0);
                const max = Math.max(...heights);
                setMaxHeight(max); // Set the maximum height
            } else {
                setMaxHeight(0); // Reset max height on smaller screens
            }
        };

        updateMaxHeight();
        window.addEventListener('resize', updateMaxHeight);

        return () => {
            window.removeEventListener('resize', updateMaxHeight);
        };
    }, [gallery]);

    if (loading) {
        return (
            <section
                id="exhibition"
                className="section pt-5 pb-5 d-flex justify-content-center align-items-center"
                style={{ minHeight: '300px' }}>
                <Loading style={{ width: 100, height: 100 }} />
            </section>
        );
    }

    // Show “no data” message if the fetched array is empty
    if (gallery.length === 0) {
        return (
            <section id="gallery" className="py-5">
                <div className="text-center text-muted">No artworks found.</div>
            </section>
        );
    }

    return (
        <>
            <Row className="grid-portfolio mt-5 justify-content-center">
                {gallery.map((galleryItem, index) => (
                    <Col md={4} className={`filter-item ${category}`} key={index}>
                        <Card id="gallery-card" className="card-portfolio-item shadow border">
                            <div className="p-2">
                                <div className="card-zoom">
                                    <Link
                                        to="#"
                                        className="image-popup"
                                        title={galleryItem.image?.caption || ''}
                                        onClick={() => openLightbox(index)}
                                        style={{
                                            textDecoration: 'none',
                                            display: 'block',
                                        }}>
                                        <div className="ratio ratio-4x3">
                                            <img
                                                src={`data:image/png;base64,${galleryItem.image}` || ''}
                                                alt={galleryItem.image?.caption || 'Gallery Image'}
                                                className="img-fluid fixed-image"
                                            />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                            <Card.Body
                                style={{
                                    minHeight: `${maxHeight}px`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center', // Centers content vertically
                                }}
                                ref={(el: HTMLDivElement | null) => (cardBodiesRef.current[index] = el)} // Explicitly type the `el` parameter
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5
                                        className="flex-grow-1"
                                        style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                        {galleryItem.title}
                                    </h5>
                                    <button
                                        className="toggle-button"
                                        onClick={() => toggleDescription(index)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#000',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                        }}>
                                        {expandedCards.has(index) ? (
                                            <i className="ms-2">▲</i>
                                        ) : (
                                            <i className="ms-2">▼</i>
                                        )}
                                    </button>
                                </div>
                                {expandedCards.has(index) && (
                                    <p className="mt-3 text-muted">{galleryItem.description}</p>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div className="text-center mt-5 pb-md-0">
                <Link to="/gallery" className="btn btn-primary">
                    <FeatherIcon icon="refresh-ccw" className="icon-xxs me-2" />
                    View More
                </Link>
            </div>

            {isOpen && (
                <LightBox
                    images={galleryImages}
                    photoIndex={photoIndex}
                    closeLightbox={closeLightbox}
                    moveNext={moveNext}
                    movePrev={movePrev}
                />
            )}
        </>
    );
};

export default Gallery;
