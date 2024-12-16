import { Container } from 'react-bootstrap';
import { Badge, Button, Card, Col, Row } from 'react-bootstrap';

import Gallery from './Gallery';

// dummy data
import { galleryItems } from './data';

const PortfolioGrid = () => {
    const limitedGalleryItems = galleryItems.slice(0, 3);

    return (
        <>
            {/* gallery */}
            <section className="overflow-hidden">
                <Container>
                    <Row>
                        <Col className="text-center">
                            <h1 className="display-5 fw-semibold">View my drawings</h1>
                        </Col>
                    </Row>
                    <Gallery galleryItems={limitedGalleryItems} />
                </Container>
            </section>
        </>
    );
};

export default PortfolioGrid;
