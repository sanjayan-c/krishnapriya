import { Container } from 'react-bootstrap';
import { Badge, Button, Card, Col, Row } from 'react-bootstrap';

import Gallery from './Gallery';

const PortfolioGrid = () => {

    return (
        <>
            <section id="gallery" className="overflow-hidden pt-5 pb-5">
                <Container>
                    <Row>
                        <Col className="text-center">
                            <h1 className="display-4 fw-bold">View my art works</h1>
                        </Col>
                    </Row>
                    <Gallery />
                </Container>
            </section>
        </>
    );
};

export default PortfolioGrid;
