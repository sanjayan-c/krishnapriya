import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Col, Row } from 'react-bootstrap';
import classNames from 'classnames';
import FeatherIcon from 'feather-icons-react';
import axios from 'axios';

import { LightBox, ImageType } from 'components/LightBox';
import { GalleryItem } from './types';

type GalleryProps = {
    galleryItems?: GalleryItem[];
};

const Gallery = ({ galleryItems = [] }: GalleryProps) => {
    const [gallery, setGallery] = useState<GalleryItem[]>(galleryItems);
    const [category, setCategory] = useState<string>('all');
    const [galleryImages, setGalleryImages] = useState<ImageType[]>(
        galleryItems.map((album) => album.image)
    );
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [photoIndex, setPhotoIndex] = useState<number>(0);

    // Fetch gallery items on mount
    useEffect(() => {
        const fetchGalleryItems = async () => {
            try {
                const response = await axios.get('http://localhost:8070/api/galleries');
                let fetchedGalleryItems = response.data;
                fetchedGalleryItems = fetchedGalleryItems.slice(0, 3);

                setGallery(fetchedGalleryItems);
                setGalleryImages(
                    fetchedGalleryItems.map((item: GalleryItem) => ({
                        src: `data:image/png;base64,${item.image}`, // Add Base64 prefix
                        caption: item.title || '', // Use the title as caption
                    }))
                );
                
                
            } catch (error) {
                console.error('Error fetching gallery items:', error);
            }
        };

        fetchGalleryItems();
    }, []); // Empty dependency array ensures this runs once on mount

    // Filter images by category
    const filterImages = (category: string) => {
        setCategory(category);

        const filteredGallery =
            category === 'all'
                ? galleryItems
                : galleryItems.filter((album) => album.category?.includes(category));

        setGallery(filteredGallery);
        setGalleryImages(filteredGallery.map((album) => album.image));
    };

    // Handle lightbox events
    const openLightbox = (index: number) => {
        setPhotoIndex(index);
        setIsOpen(true);
    };

    const closeLightbox = () => setIsOpen(false);

    const moveNext = () => setPhotoIndex((prev) => (prev + 1) % galleryImages.length);

    const movePrev = () =>
        setPhotoIndex((prev) => (prev + galleryImages.length - 1) % galleryImages.length);

    return (
        <>
            <Row className="grid-portfolio mt-5 justify-content-center">
                {gallery.map((galleryItem, index) => (
                    <Col xl={4} sm={6} className={`filter-item ${category}`} key={index}>
                        <Card className="card-portfolio-item shadow border">
                            <div className="p-2">
                                <div className="card-zoom">
                                    <Link
                                        to="#"
                                        className="image-popup"
                                        title={galleryItem.image?.caption || ''}
                                        onClick={() => openLightbox(index)}
                                    >
                                        <img
                                            src={`data:image/png;base64,${galleryItem.image}`  || ''}
                                            alt={galleryItem.image?.caption || 'Gallery Image'}
                                            className="img-fluid"
                                        />
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
                    </Col>
                ))}
            </Row>

            <div className="text-center mt-5 pb-md-0">
                <Link to="#" className="btn btn-primary">
                    <FeatherIcon icon="refresh-ccw" className="icon-xxs me-2" />
                    Load More
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
