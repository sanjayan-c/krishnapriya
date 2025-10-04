import { useEffect, useState, useRef } from 'react';
import { Card } from 'react-bootstrap';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import axios from 'axios';
import { LightBox, ImageType } from 'components/LightBox';
import Loading from '../../Loading/index';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';

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
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [photoIndex, setPhotoIndex] = useState<number>(0);
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    const cardBodiesRef = useRef<(HTMLDivElement | null)[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const getShareUrl = (id: string) => `${window.location.origin}/gallery?art=${id}`;

    const shareItem = async (item: GalleryItem) => {
        const url = getShareUrl(item._id);
        const title = item.title || 'Artwork';

        try {
            if (navigator.share) {
                await navigator.share({ title, url });
                return;
            }
            await navigator.clipboard.writeText(url);
        } catch {
            await navigator.clipboard.writeText(url);
        }
    };

    // Fetch gallery items from API
    useEffect(() => {
        const fetchGalleryItems = async () => {
            try {
                setLoading(true);
                const baseUrl = process.env.REACT_APP_BASE_URL;
                const response = await axios.get(`${baseUrl}/api/galleries`);

                // Normalize to an array
                const raw = response.data;
                const list: GalleryItem[] = Array.isArray(raw) ? raw : Array.isArray(raw?.items) ? raw.items : [];

                // Hydrate image with data URL prefix
                const hydrated = list.map((item: any) => ({
                    ...item,
                    image: `data:image/png;base64,${item.image}`,
                }));

                setGallery(hydrated);
                setGalleryImages(
                    hydrated.map((item: GalleryItem) => ({
                        src: item.image,
                        caption: item.title || '',
                    }))
                );
                const params = new URLSearchParams(window.location.search);
                const artId = params.get('art');
                if (artId) {
                    const idx = hydrated.findIndex((g) => g._id === artId);
                    if (idx >= 0) {
                        setPhotoIndex(idx);
                        setIsOpen(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching gallery items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGalleryItems();
    }, []);

    // Toggle description for expandable card
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

    // Handle Lightbox events
    const openLightbox = (index: number) => {
        setPhotoIndex(index);
        setIsOpen(true);

        const id = gallery[index]._id;
        const url = new URL(window.location.href);
        url.searchParams.set('art', id);
        // push without reloading
        window.history.pushState({}, '', url.toString());
    };

    const closeLightbox = () => {
        setIsOpen(false);
        const url = new URL(window.location.href);
        url.searchParams.delete('art');
        window.history.pushState({}, '', url.toString());
    };

    const moveNext = () => setPhotoIndex((prev) => (prev + 1) % galleryImages.length);

    const movePrev = () => setPhotoIndex((prev) => (prev + galleryImages.length - 1) % galleryImages.length);

    if (loading) {
        return (
            <section
                id="exhibition"
                className="section pt-5 pb-5 d-flex justify-content-center align-items-center"
                style={{ minHeight: '500px' }}>
                <Loading style={{ width: 300, height: 300 }} />
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
            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 1024: 3 }}>
                <Masonry gutter="1.5rem">
                    {gallery.map((galleryItem, index) => (
                        <Card
                            key={galleryItem._id}
                            id="gallery-page-card"
                            className="card-portfolio-item shadow border">
                            <div className="p-2">
                                <div className="card-zoom">
                                    <Link
                                        to="#"
                                        className="image-popup"
                                        title={galleryItem.title}
                                        onClick={() => openLightbox(index)}
                                        style={{ textDecoration: 'none', display: 'block' }}>
                                        {/* <div className="ratio ratio-4x3"> */}
                                        <img
                                            src={galleryItem.image}
                                            alt={galleryItem.title}
                                            className="img-fluid fixed-image"
                                        />
                                        {/* </div> */}
                                    </Link>
                                </div>
                            </div>
                            <Card.Body ref={(el: HTMLDivElement | null) => (cardBodiesRef.current[index] = el)}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5
                                        className="flex-grow-1 me-2"
                                        style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
                                        {galleryItem.title}
                                    </h5>

                                    <div className="d-flex gap-2">
                                        {/* Share (uses Web Share API where supported, otherwise copies) */}
                                        <button
                                            className="btn btn-primary btn-sm"
                                            title="Share"
                                            onClick={() => shareItem(galleryItem)}>
                                            <FeatherIcon icon="share-2" size={16} />
                                        </button>
                                    </div>
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
        </>
    );
};

export default Gallery;
