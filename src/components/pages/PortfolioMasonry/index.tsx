import { Container } from 'react-bootstrap';

// component
import BackToTop from 'components/BackToTop';

import Gallery from './Gallery';
import { galleryItems } from './data';

const PortfolioMasonry = () => {
    return (
        <>
            {/* gallery */}
            <section className="overflow-hidden py-5 py-md-6 py-lg-7">
                <Container>
                    <Gallery galleryItems={galleryItems} />
                </Container>
            </section>


            <BackToTop />
        </>
    );
};

export default PortfolioMasonry;
