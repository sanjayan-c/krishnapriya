// import { useEffect, useState } from 'react';
// import { Card, Col, Container, Row } from 'react-bootstrap';
// import axios from 'axios';
// import Navbar3 from 'components/navbars/Navbar3';
// import Footer from '../../Footer/Footer';

// type BlogPost = {
//     title: string;
//     description: string;
//     time: string;
//     img: string;
//     link: string;
// };

// const DEFAULT_IMAGE =
//     'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTo-02XhMYW_2-8ITemzxz95v5Ed6jBPq7HQ&s';

// const Article = () => {
//     const [blogs, setBlogs] = useState<BlogPost[]>([]);

//     const formatDate = (dateString: string): string => {
//         if (!dateString) return ''; // Return blank for empty dates
//         try {
//             const date = new Date(dateString);
//             if (isNaN(date.getTime())) return ''; // Return blank for invalid dates
//             return date.toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//             });
//         } catch (error) {
//             return ''; // Return blank for errors
//         }
//     };

//     useEffect(() => {
//         const fetchLinksAndMetadata = async () => {
//             try {
//                 const response = await axios.get('/links.json');
//                 const links: string[] = response.data.links;

//                 links.forEach(async (link) => {
//                     try {
//                         const metadataResponse = await axios.get(
//                             `http://localhost:8070/api/articles/metadata?url=${encodeURIComponent(link)}`
//                         );
//                         const metadata = metadataResponse.data;

//                         setBlogs((prevBlogs) => [
//                             ...prevBlogs,
//                             {
//                                 title: metadata.title || 'No Title',
//                                 description: metadata.description || 'No Description',
//                                 time: formatDate(metadata.date),
//                                 img: metadata.image || DEFAULT_IMAGE,
//                                 link: link,
//                             },
//                         ]);
//                     } catch (error) {
//                         console.error(`Error fetching metadata for ${link}:`, error);
//                     }
//                 });
//             } catch (error) {
//                 console.error('Error fetching links:', error);
//             }
//         };

//         fetchLinksAndMetadata();
//     }, []);

//     return (
//         <>
//             <div className="header-7 bg-gradient2">
//                 <Navbar3
//                     navClass="custom-navbar-class zindex-10"
//                     isSticky
//                     fixedWidth
//                     buttonClass="btn-outline-light btn-sm"
//                 />
//                 <section className="hero-4 pt-lg-6 pb-sm-9 pb-6 pt-9 mb-6 bg-gradient2">
//                     <Container>
//                         <Row className="justify-content-center">
//                             <Col lg={7} className="text-center">
//                                 <h1 className="display-3 mb-0" style={{ color: '#ffffff', fontWeight: 'bold' }}>
//                                     Articles
//                                 </h1>
//                                 <p className="mb-4 fs-17 mt-4" style={{ color: '#ffffff' }}>
//                                     These articles showcase my journey and achievements through others' perspectives.
//                                 </p>
//                             </Col>
//                         </Row>
//                     </Container>
//                     <div className="shape bottom">
//                         <svg
//                             width="1440px"
//                             height="40px"
//                             viewBox="0 0 1440 40"
//                             version="1.1"
//                             xmlns="http://www.w3.org/2000/svg"
//                         >
//                             <g id="shape-b" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
//                                 <g id="curve" fill="#fff">
//                                     <path
//                                         d="M0,30.013 C239.659,10.004 479.143,0 718.453,0 C957.763,0 1198.28,10.004 1440,30.013 L1440,40 L0,40 L0,30.013 Z"
//                                         id="Path"
//                                     ></path>
//                                 </g>
//                             </g>
//                         </svg>
//                     </div>
//                 </section>
//             </div>

//             <section id="exhibition" className="section position-relative pb-5 pb-md-6 pb-lg-7">
//                 <Container>
//                     <Row className="mt-3">
//                         {blogs.map((blog, index) => (
//                             <Col md={4} key={index}>
//                                 <a
//                                     href={blog.link}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-decoration-none"
//                                 >
//                                     <Card className="shadow h-100" data-aos="fade-up" data-aos-duration="500">
//                                         <div className="card-img-top-overlay">
//                                             <img
//                                                 src={blog.img}
//                                                 alt="Image not available"
//                                                 className="card-img-top fixed-image"
//                                             />
//                                         </div>
//                                         <Card.Body>
//                                             <h4 className="text-dark">{blog.title}</h4>
//                                             {blog.time && (
//                                                 <p className="fs-13 align-middle">{blog.time}</p>
//                                             )}
//                                         </Card.Body>
//                                     </Card>
//                                 </a>
//                             </Col>
//                         ))}
//                     </Row>
//                 </Container>
//             </section>
//             <Footer />
//         </>
//     );
// };

// export default Article;

import { useEffect, useState, useRef } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import axios from 'axios';
import Navbar3 from 'components/navbars/Navbar3';
import Footer from '../../Footer/Footer';
import Loading from '../../Loading/index';
import placeholder from '../../../assets/images/photos/no_image_placeholder.png';

type BlogPost = {
    title: string;
    description: string;
    time: string;
    img: string;
    link: string;
};


const Article = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [maxHeight, setMaxHeight] = useState<number>(0); // Track maximum height for cards
    const cardBodiesRef = useRef<(HTMLDivElement | null)[]>([]); // Ref for card bodies

    const [loading, setLoading] = useState(true);

    const formatDate = (dateString: string): string => {
        if (!dateString) return ''; // Return blank for empty dates
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return ''; // Return blank for invalid dates
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (error) {
            return ''; // Return blank for errors
        }
    };

    const truncateTitle = (title: string): string => (title.length > 50 ? `${title.slice(0, 50)}...` : title);

    useEffect(() => {
        const fetchLinksAndMetadata = async () => {
            setLoading(true);

            try {
                // 1) get the list of article URLs
                const response = await axios.get('/links.json');
                const links: string[] = response.data.links || [];

                // 2) in parallel, fetch metadata for each link
                const blogsData: BlogPost[] = await Promise.all(
                    links.map(async (link) => {
                        try {
                            const baseUrl = process.env.REACT_APP_BASE_URL;
                            const { data: metadata } = await axios.get(
                                `${baseUrl}/api/articles/metadata?url=${encodeURIComponent(link)}`
                            );
                            return {
                                title: metadata.title || 'No Title',
                                description: metadata.description || 'No Description',
                                time: formatDate(metadata.date),
                                img: metadata.image || placeholder,
                                link,
                            };
                        } catch (err) {
                            console.error(`Error fetching metadata for ${link}:`, err);
                            // return a “fallback” blog entry on error
                            return {
                                title: 'Error loading article',
                                description: '',
                                time: '',
                                img: placeholder,
                                link,
                            };
                        }
                    })
                );

                // 3) update state once, after everything
                setBlogs(blogsData);
            } catch (err) {
                console.error('Error fetching links.json:', err);
            } finally {
                // 4) and *then* hide spinner
                setLoading(false);
            }
        };

        fetchLinksAndMetadata();
    }, []);

    useEffect(() => {
        const calculateMaxHeight = () => {
            if (window.innerWidth >= 768 && cardBodiesRef.current.length > 0) {
                const heights = cardBodiesRef.current.map((el) => el?.clientHeight || 0);
                setMaxHeight(Math.max(...heights));
            } else {
                setMaxHeight(0); // Reset max height on smaller screens
            }
        };

        calculateMaxHeight();

        window.addEventListener('resize', calculateMaxHeight);
        return () => {
            window.removeEventListener('resize', calculateMaxHeight);
        };
    }, [blogs]);

    return (
        <>
            <div className="header-7 bg-gradient2">
                <Navbar3
                    navClass="custom-navbar-class zindex-10"
                    isSticky
                    fixedWidth
                    buttonClass="btn-outline-light btn-sm"
                />
                <section id="article" className="hero-4 pt-lg-6 pb-sm-9 pb-6 pt-9 mb-6 bg-gradient2">
                    <Container>
                        <Row className="justify-content-center">
                            <Col lg={7} className="text-center">
                                <h1 className="display-3 mb-0" style={{ color: '#ffffff', fontWeight: 'bold' }}>
                                    Articles
                                </h1>
                                <p className="mb-4 fs-17 mt-4" style={{ color: '#ffffff' }}>
                                    These articles showcase my journey and achievements through others' perspectives.
                                </p>
                            </Col>
                        </Row>
                    </Container>
                    <div className="shape bottom">
                        <svg
                            width="1440px"
                            height="40px"
                            viewBox="0 0 1440 40"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg">
                            <g id="shape-b" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="curve" fill="#fff">
                                    <path
                                        d="M0,30.013 C239.659,10.004 479.143,0 718.453,0 C957.763,0 1198.28,10.004 1440,30.013 L1440,40 L0,40 L0,30.013 Z"
                                        id="Path"></path>
                                </g>
                            </g>
                        </svg>
                    </div>
                </section>
            </div>

            <section id="exhibition" className="section position-relative pb-5 pb-md-6 pb-lg-7">
                <Container>
                    {loading ? (
                        <section
                            id="exhibition"
                            className="section pt-5 pb-5 d-flex justify-content-center align-items-center"
                            style={{ minHeight: '500px' }}>
                            <Loading style={{ width: 300, height: 300 }} />
                        </section>
                    ) : (
                        <>
                            <Row className="mt-3">
                                {blogs.map((blog, index) => (
                                    <Col md={4} key={index}>
                                        <a
                                            href={blog.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-decoration-none d-block">
                                            <Card className="shadow h-100" data-aos="fade-up" data-aos-duration="500">
                                                <div className="card-img-top-overlay">
                                                    <div className="ratio ratio-4x3">
                                                        <img
                                                            src={blog.img}
                                                            alt="Image not available"
                                                            className="card-img-top fixed-image"
                                                        />
                                                    </div>
                                                </div>
                                                <Card.Body
                                                    className="card-body-content"
                                                    style={{ minHeight: `${maxHeight}px` }}
                                                    ref={(el: HTMLDivElement | null) =>
                                                        (cardBodiesRef.current[index] = el)
                                                    }>
                                                    <h4>{truncateTitle(blog.title)}</h4>
                                                    {blog.time && (
                                                        <p className="fs-13 align-middle mb-0">{blog.time}</p>
                                                    )}
                                                </Card.Body>
                                            </Card>
                                        </a>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </Container>
            </section>
            <Footer />
        </>
    );
};

export default Article;
