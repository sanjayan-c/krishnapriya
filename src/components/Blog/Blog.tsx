// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Badge, Card, Col, Container, Row } from 'react-bootstrap';
// import axios from 'axios';

// type BlogPost = {
//     title: string;
//     description: string;
//     time: string;
//     img: string; // Single image for the card
// };

// const Blog = () => {
//     const [blogs, setBlogs] = useState<BlogPost[]>([]);

//     // Fetch blog data from API
//     useEffect(() => {
//         const fetchBlogs = async () => {
//             try {
//                 const response = await axios.get('http://localhost:8070/api/exhibitions');
//                 let fetchedBlogs = response.data.map((article: any) => ({
//                     title: article.title,
//                     description: article.description,
//                     time: new Date(article.date).toLocaleDateString(), // Format the date
//                     img: `data:image/png;base64,${article.images[0]}`, // Use the first image in the array
//                 }));

//                 setBlogs(fetchedBlogs);
//             } catch (error) {
//                 console.error('Error fetching blogs:', error);
//             }
//         };

//         fetchBlogs();
//     }, []);

//     return (
//         <section id="exhibition" className="section pt-lg-8 pt-6 pb-5 position-relative">
//             <Container>
//                 <Row>
//                     <Col className="text-center">
//                         <h1 className="display-5 fw-semibold">Exhibition</h1>
//                     </Col>
//                 </Row>
//                 <Row className="mt-5">
//                     {(blogs || []).map((blog, index) => (
//                         <Col md={4} key={index.toString()}>
//                             <Card className="shadow" data-aos="fade-up" data-aos-duration="500">
//                                 <div className="card-img-top-overlay">
//                                     <div className="overlay"></div>
//                                     <span className="card-badge top-right bg-secondary text-white">Design</span>

//                                     <div className="position-relative">
//                                         <img src={blog.img} alt="blog" className="card-img-top  fixed-image" />
//                                         <div className="shape text-white bottom">
//                                             {/* Placeholder for custom shape */}
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <Card.Body>
//                                     <div className="mt-2">
//                                         <Row className="align-items-center">
//                                             <Col xs="auto">
//                                                 <p className="mb-0">
//                                                     <span className="fs-13 align-middle">{blog.time}</span>
//                                                 </p>
//                                             </Col>
//                                         </Row>
//                                     </div>
//                                     <div className="mt-2">
//                                         <h4>
//                                             <Link to="#" className="card-title-link">
//                                                 {blog.title}
//                                             </Link>
//                                         </h4>
//                                         <p className="text-muted mb-2">
//                                             {blog.description}{' '}
//                                         </p>
//                                     </div>
//                                 </Card.Body>
//                             </Card>
//                         </Col>
//                     ))}
//                 </Row>
//             </Container>
//         </section>
//     );
// };

// export default Blog;

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Col, Container, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import axios from 'axios';

type BlogPost = {
    title: string;
    description: string;
    time: string;
    img: string; // Single image for the card
};

const Blog = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [limitedBlogs, setLimitedBlogs] = useState<BlogPost[]>([]);
    const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set()); // Track expanded post IDs
    const [maxHeight, setMaxHeight] = useState<number>(0); // State to store the max height
    const cardBodiesRef = useRef<(HTMLDivElement | null)[]>([]); // Ref for storing card body elements
    const navigate = useNavigate();

    // Fetch blog data from API
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const baseUrl = process.env.REACT_APP_BASE_URL;
                const response = await axios.get(`${baseUrl}/api/exhibitions`);
                let fetchedBlogs = response.data.map((article: any) => ({
                    title: article.title,
                    description: article.description,
                    time: new Date(article.date).toLocaleDateString(), // Format the date
                    img: `data:image/png;base64,${article.images[0]}`, // Use the first image in the array
                }));
                setBlogs(fetchedBlogs);
                setLimitedBlogs(fetchedBlogs.slice(0, 3)); // Load only the first three
            } catch (error) {
                console.error('Error fetching blogs:', error);
            }
        };

        fetchBlogs();
    }, []);

    // Function to truncate description and show Read More
    const truncateDescription = (description: string) => {
        const maxLength = 80;
        if (description.length > maxLength) {
            return {
                truncated: description.slice(0, maxLength) + '...',
                full: description,
            };
        }
        return { truncated: description, full: description };
    };

    // Toggle expanded state for a specific post
    const toggleExpand = (index: number) => {
        const updatedExpandedPosts = new Set(expandedPosts);
        if (updatedExpandedPosts.has(index)) {
            updatedExpandedPosts.delete(index); // Remove the post from expanded state
        } else {
            updatedExpandedPosts.add(index); // Add the post to expanded state
        }
        setExpandedPosts(updatedExpandedPosts);
    };

    // Calculate the max height of all card bodies after component mounts
    useEffect(() => {
        const updateMaxHeight = () => {
            // Check if the screen width is large enough (for example, greater than 768px for laptops)
            if (window.innerWidth >= 768 && cardBodiesRef.current.length > 0) {
                const heights = cardBodiesRef.current.map((ref) => ref?.clientHeight || 0);
                const max = Math.max(...heights);
                setMaxHeight(max); // Set the maximum height
            } else {
                setMaxHeight(0); // Reset max height on smaller screens
            }
        };

        // Call the function initially
        updateMaxHeight();

        // Add event listener to update max height on window resize
        window.addEventListener('resize', updateMaxHeight);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', updateMaxHeight);
        };
    }, [limitedBlogs]);

    return (
        <section id="exhibition" className="section pt-5 pb-5 position-relative">
            <Container>
                <Row>
                    <Col className="text-center">
                        <h1 className="display-4 fw-bold">Exhibition</h1>
                    </Col>
                </Row>
                <Row className="grid-portfolio mt-5">
                    {limitedBlogs.map((blog, index) => {
                        const { truncated, full } = truncateDescription(blog.description);
                        const isExpanded = expandedPosts.has(index); // Check if this post is expanded

                        return (
                            <Col md={4} key={index.toString()}>
                                <Card className="shadow border" data-aos="fade-up" data-aos-duration="500">
                                    <div className="card-img-top-overlay">
                                        <div className="overlay"></div>
                                        <span className="card-badge top-right bg-primary text-white">Design</span>

                                        <div className="position-relative">
                                            <div className="ratio ratio-4x3">
                                                <img src={blog.img} alt="blog" className="card-img-top fixed-image" />
                                            </div>
                                            <div className="shape text-white bottom"></div>
                                        </div>
                                    </div>
                                    <Card.Body
                                        style={{ minHeight: `${maxHeight}px` }}
                                        ref={(el: HTMLDivElement | null) => (cardBodiesRef.current[index] = el)} // Explicitly type the `el` parameter
                                    >
                                        <div className="mt-2">
                                            <Row className="align-items-center">
                                                <Col xs="auto">
                                                    <p className="mb-0">
                                                        <span className="fs-13 align-middle">{blog.time}</span>
                                                    </p>
                                                </Col>
                                            </Row>
                                        </div>
                                        <div className="mt-2">
                                            <h4>
                                                {/* <Link to="#" className="card-title-link"> */}
                                                    {blog.title}
                                                {/* </Link> */}
                                            </h4>
                                            <p className="text-muted mb-2">
                                                {isExpanded ? full : truncated}
                                            </p>
                                            {full !== truncated && (
                                                <div className="mt-2"> {/* Force the button to a new line */}
                                                    <button
                                                        className="btn btn-link p-0 no-underline"
                                                        onClick={() => toggleExpand(index)} // Toggle the expanded state
                                                    >
                                                        {isExpanded ? 'Show Less' : 'Read More'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
                <div className="text-center mt-5 pb-md-0">
                    <Link to="/exhibition" className="btn btn-primary">
                        <FeatherIcon icon="refresh-ccw" className="icon-xxs me-2" />
                        View More
                    </Link>
                </div>
            </Container>
        </section>
    );
};

export default Blog;


    // import { useState, useEffect } from 'react';
    // import { Link, useNavigate } from 'react-router-dom';
    // import { Card, Col, Container, Row } from 'react-bootstrap';
    // import FeatherIcon from 'feather-icons-react';
    // import axios from 'axios';

    // type BlogPost = {
    //     title: string;
    //     description: string;
    //     time: string;
    //     img: string; // Single image for the card
    // };

    // const Blog = () => {
    //     const [blogs, setBlogs] = useState<BlogPost[]>([]);
    //     const [limitedBlogs, setLimitedBlogs] = useState<BlogPost[]>([]);
    //     const navigate = useNavigate();

    //     // Fetch blog data from API
    //     useEffect(() => {
    //         const fetchBlogs = async () => {
    //             try {
    //                 const response = await axios.get('http://localhost:8070/api/exhibitions');
    //                 let fetchedBlogs = response.data.map((article: any) => ({
    //                     title: article.title,
    //                     description: article.description,
    //                     time: new Date(article.date).toLocaleDateString(), // Format the date
    //                     img: `data:image/png;base64,${article.images[0]}`, // Use the first image in the array
    //                 }));
    //                 setBlogs(fetchedBlogs);
    //                 setLimitedBlogs(fetchedBlogs.slice(0, 3)); // Load only the first three
    //             } catch (error) {
    //                 console.error('Error fetching blogs:', error);
    //             }
    //         };

    //         fetchBlogs();
    //     }, []);

    //     const handleViewMore = () => {
    //         navigate('/blog'); // Navigate to another page (replace '/blog' with your route)
    //     };

    //     return (
    //         <section id="exhibition" className="section pt-5 pb-5 position-relative">
    //             <Container>
    //                 <Row>
    //                     <Col className="text-center">
    //                         <h1 className="display-4 fw-bold">Exhibition</h1>
    //                     </Col>
    //                 </Row>
    //                 <Row className="grid-portfolio mt-5">
    //                     {limitedBlogs.map((blog, index) => (
    //                         <Col md={4} key={index.toString()}>
    //                             <Card className="shadow border" data-aos="fade-up" data-aos-duration="500">
    //                                 <div className="card-img-top-overlay">
    //                                     <div className="overlay"></div>
    //                                     <span className="card-badge top-right bg-primary text-white">Design</span>

    //                                     <div className="position-relative">
    //                                         <div className="ratio ratio-4x3">
    //                                             <img src={blog.img} alt="blog" className="card-img-top fixed-image" />
    //                                         </div>
    //                                         <div className="shape text-white bottom"></div>
    //                                     </div>
    //                                 </div>
    //                                 <Card.Body>
    //                                     <div className="mt-2">
    //                                         <Row className="align-items-center">
    //                                             <Col xs="auto">
    //                                                 <p className="mb-0">
    //                                                     <span className="fs-13 align-middle">{blog.time}</span>
    //                                                 </p>
    //                                             </Col>
    //                                         </Row>
    //                                     </div>
    //                                     <div className="mt-2">
    //                                         <h4>
    //                                             <Link to="#" className="card-title-link">
    //                                                 {blog.title}
    //                                             </Link>
    //                                         </h4>
    //                                         <p className="text-muted mb-2">{blog.description}</p>
    //                                     </div>
    //                                 </Card.Body>
    //                             </Card>
    //                         </Col>
    //                     ))}
    //                 </Row>
    //                 <div className="text-center mt-5 pb-md-0">
    //                     <Link to="/gallery" className="btn btn-primary">
    //                         <FeatherIcon icon="refresh-ccw" className="icon-xxs me-2" />
    //                         View More
    //                     </Link>
    //                 </div>
    //             </Container>
    //         </section>
    //     );
    // };

    // export default Blog;
