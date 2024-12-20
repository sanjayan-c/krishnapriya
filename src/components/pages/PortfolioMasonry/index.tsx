import { Container } from 'react-bootstrap';

// component
import BackToTop from 'components/BackToTop';

import Gallery from './Gallery';

const PortfolioMasonry = () => {
    return (
        <>
            {/* gallery */}
            {/* <section className="overflow-hidden py-5 py-md-6 py-lg-7">
                <Container>
                    <Gallery />
                </Container>
            </section> */}
            <Gallery />

            <BackToTop />
        </>
    );
};

export default PortfolioMasonry;
