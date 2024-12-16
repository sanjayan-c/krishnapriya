// components
import BackToTop from '../../BackToTop';

import Hero from 'components/Hero/Hero';
import Features from '../../About/About';
import Footer from '../../Footer/Footer';
import PortfolioGrid from 'components/PortfolioGrid';
import Testimonials from '../../Testimonials/Testimonials';
import Contact from 'components/Contact';
import Blog from '../../Blog/Blog';
import { blogPosts } from '../../Blog/data blogs';

import Navbar3 from 'components/navbars/Navbar3';

const Home = () => {
    return (
        <>
            <div className="bg-gradient3">
                <Navbar3
                    navClass="bg-white navbar-light zindex-10"
                    isSticky
                    fixedWidth
                    buttonClass="btn-outline-primary btn-sm"
                />
                <Hero/>
               
            </div>
            <Features/>

            <PortfolioGrid/>

            <Testimonials/>

            <Blog blogs={blogPosts} />
         
            <Contact/>

            {/* footer */}
            <Footer />

            <BackToTop />
        </>
    );
};

export default Home;
