import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Col, Row } from 'react-bootstrap';
import classNames from 'classnames';
import FeatherIcon from 'feather-icons-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import axios from 'axios';
import { LightBox, ImageType } from 'components/LightBox';
import Navbar3 from 'components/navbars/Navbar3';
import Footer from '../../Footer/Footer'

type GalleryItem = {
    _id: string;
    title: string;
    description: string;
    image: string; // Base64-encoded image string
    category?: string; // Optional category for filtering
};

const Gallery = () => {
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [galleryImages, setGalleryImages] = useState<ImageType[]>([]);
    const [category, setCategory] = useState<string>('all');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [photoIndex, setPhotoIndex] = useState<number>(0);

    // Fetch gallery items from API
    useEffect(() => {
        const fetchGalleryItems = async () => {
            try {
                const response = await axios.get('http://localhost:8070/api/galleries');
                const fetchedGalleryItems = response.data.map((item: any) => ({
                    ...item,
                    image: `data:image/png;base64,${item.image}`, // Convert Base64 to valid data URL
                }));
                setGallery(fetchedGalleryItems);
                setGalleryImages(
                    fetchedGalleryItems.map((item: GalleryItem) => ({
                        src: item.image,
                        caption: item.title,
                    }))
                );
            } catch (error) {
                console.error('Error fetching gallery items:', error);
            }
        };

        fetchGalleryItems();
    }, []);

    // Filter images by category
    const filterImages = (category: string) => {
        setCategory(category);
        const filteredGallery =
            category === 'all' ? gallery : gallery.filter((item) => item.category?.includes(category));
        setGallery(filteredGallery);
        setGalleryImages(
            filteredGallery.map((item) => ({
                src: item.image,
                caption: item.title,
            }))
        );
    };

    // Handle Lightbox events
    const openLightbox = (index: number) => {
        setPhotoIndex(index);
        setIsOpen(true);
    };

    const closeLightbox = () => setIsOpen(false);

    const moveNext = () => setPhotoIndex((prev) => (prev + 1) % galleryImages.length);

    const movePrev = () => setPhotoIndex((prev) => (prev + galleryImages.length - 1) % galleryImages.length);

    return (
        <>
            <div className="bg-gradient3">
                <Navbar3
                    navClass="custom-navbar-class zindex-10"
                    isSticky
                    fixedWidth
                    buttonClass="btn-outline-light btn-sm"
                /> 
            </div>
            <Row>
                <Col className="text-center">
                    <h1 className="display-5 fw-semibold">Gallery</h1>
                </Col>
            </Row>
            <ResponsiveMasonry >
                <Masonry gutter="1.5rem">
                    {gallery.map((galleryItem, index) => (
                        <Card className="card-portfolio-item mb-0 shadow border filter-item" key={galleryItem._id}>
                            <div className="p-2">
                                <div className="card-zoom">
                                    <Link
                                        to="#"
                                        className="image-popup"
                                        title={galleryItem.title}
                                        onClick={() => openLightbox(index)}
                                    >
                                        <img src={galleryItem.image} alt={galleryItem.title} className="img-fluid" />
                                    </Link>
                                </div>
                            </div>
                            <Card.Body className="p-2">
                                <div className="mt-2">
                                    <h5 className="mt-0">{galleryItem.title}</h5>
                                    <p className="text-muted mb-1">{galleryItem.description}</p>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                </Masonry>
            </ResponsiveMasonry>

            {/* Image Lightbox */}
            {isOpen && (
                <LightBox
                    images={galleryImages}
                    photoIndex={photoIndex}
                    closeLightbox={closeLightbox}
                    moveNext={moveNext}
                    movePrev={movePrev}
                />
            )}
            <Footer />
        </>
    );
};

export default Gallery;
