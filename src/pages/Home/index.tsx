// components
import Navbar1 from '../../components/navbars/Navbar1';
import BackToTop from '../../components/BackToTop';

import Hero from './Hero';
import Demos from './Demos';
import InnerPages from './InnerPages';
import AccountPages from './AccountPages';
import Features from './Features';
import CTA from './CTA';
import Footer from './Footer';
import PortfolioGrid from 'components/PortfolioGrid';
import Testimonials from './Testimonials';
import Contact from 'components/Contact';
import Blog from './Blog';
import { blogPosts, jobDetails, services } from './data blogs';


// dummy data
import { landings, secondaryPages, accountPages, features } from './data';
import { Navbar3 } from 'components/navbars';

const Home = () => {
    return (
        <>
            <div className="bg-gradient3">
                <Navbar3
                    navClass="bg-white navbar-light zindex-10"
                    // hideSearch
                    isSticky
                    fixedWidth
                    buttonClass="btn-outline-primary btn-sm"
                />
<Hero/>
               
            </div>
            <Features/>

            <PortfolioGrid/>

            <Testimonials/>

            <Contact/>

            <Blog blogs={blogPosts} />


         

            {/* footer */}
            <Footer />

            <BackToTop />
        </>
    );
};

export default Home;
