import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import GoogleMapReact from 'google-map-react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FeatherIcon from 'feather-icons-react';

// components
import { FormInput } from 'components/form';

// Define the type for form data
type ContactFormData = {
    fname: string;
    lname: string;
    email: string;
    message: string;
};

const ContactUs = () => {
    // form validation schema
    const schemaResolver = yupResolver(
        yup.object().shape({
            fname: yup.string().required('Please enter first name'),
            lname: yup.string().required('Please enter last name'),
            email: yup.string().required('Please enter Email').email('Please enter valid Email'),
            message: yup.string().required('Please enter Message'),
        })
    );

    // form method
    const methods = useForm<ContactFormData>({ resolver: schemaResolver });
    const {
        handleSubmit,
        register,
        control,
        formState: { errors },
    } = methods;

    // handle form submission
    const onSubmit = async (data: ContactFormData) => {
        try {
            const baseUrl = process.env.REACT_APP_BASE_URL;
            const response = await fetch(`${baseUrl}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <section id="contact" className="section pt-6 pb-5 position-relative">
            <Container>
                <Row>
                    <Col className="text-center">
                        <h1 className="display-4 fw-bold">Let's Talk Further</h1>
                    </Col>
                </Row>
                <Row className="align-items-center">
                    <Col lg={6}>
                        <Card className="shadow-none">
                            <Card.Body className="p-xl-5 p-0">
                                {/* <h2 className="mb-2 mt-0 fw-medium">Let's Talk Further</h2> */}
                                <p className="mb-5">
                                    Please fill out the following form and we will get back to you shortly
                                </p>

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Row>
                                        <Col md={6}>
                                            <FormInput
                                                type="text"
                                                name="fname"
                                                label="First Name"
                                                placeholder="Your First Name"
                                                containerClass={'mb-3'}
                                                register={register}
                                                errors={errors}
                                                control={control}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <FormInput
                                                type="text"
                                                name="lname"
                                                label="Last Name"
                                                placeholder="Your Last Name"
                                                containerClass={'mb-3'}
                                                register={register}
                                                errors={errors}
                                                control={control}
                                            />
                                        </Col>
                                        <Col lg={12}>
                                            <FormInput
                                                type="email"
                                                name="email"
                                                label="Email Name"
                                                placeholder="Your Email"
                                                containerClass={'mb-3'}
                                                register={register}
                                                errors={errors}
                                                control={control}
                                            />
                                        </Col>
                                        <Col lg={12}>
                                            <FormInput
                                                type="textarea"
                                                name="message"
                                                label="Message"
                                                placeholder="Type Your message..."
                                                rows={5}
                                                containerClass={'mb-3'}
                                                register={register}
                                                errors={errors}
                                                control={control}
                                            />
                                        </Col>
                                        <Col lg="auto" className="mb-0">
                                            <Button type="submit">
                                                Send
                                                <span className="icon icon-xs text-white ms-1">
                                                    <FeatherIcon icon="send" />
                                                </span>
                                            </Button>
                                        </Col>
                                    </Row>
                                </form>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* <Col lg={{ offset: 1, span: 5 }}>
                        <div style={{ height: '520px' }}>
                            <GoogleMapReact defaultZoom={12} defaultCenter={{ lat: 40.749179, lng: -73.989276 }} />
                        </div>
                    </Col> */}
                    <Col lg={{ span: 6 }}>
                        <div style={{ height: '520px', overflow: 'hidden', borderRadius: '8px' }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d245.80615633057124!2d80.01317532482598!3d9.689703649604176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afe5550ffb31311%3A0xd568c4feb027ce36!2z4K6a4K-B4K6q4K644K-N4K6k4K6-4K6p4K-N!5e0!3m2!1sen!2slk!4v1734982958227!5m2!1sen!2slk"
                                width="100%"
                                height="100%"
                                style={{ border: '0' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"></iframe>
                        </div>
                    </Col>
                </Row>
                <Row className="mt-5 align-items-center">
                    <Col md={4}>
                        <div className="d-flex px-md-1 px-lg-5 mb-md-0 mb-3">
                            <span className="bg-soft-primary avatar avatar-sm rounded icon icon-with-bg icon-xs text-primary me-3 flex-shrink-0">
                                <FeatherIcon icon="mail" className="icon-dual-primary" />
                            </span>
                            <div className="flex-grow-1">
                                <h5 className="m-0 fw-medium">Email</h5>
                                <Link to="#" className="text-muted fw-normal h5 my-1">
                                    youremail@gmail.com
                                </Link>
                            </div>
                        </div>
                    </Col>

                    <Col md={4}>
                        <div className="d-flex px-md-1 px-lg-5 mb-md-0 mb-3">
                            <span className="bg-soft-primary avatar avatar-sm rounded icon icon-with-bg icon-xs text-orange me-3 flex-shrink-0">
                                <FeatherIcon icon="phone-call" className="icon-dual-primary" />
                            </span>
                            <div className="flex-grow-1">
                                <h5 className="m-0 fw-medium">Phone</h5>
                                <Link to="#" className="text-muted fw-normal h5 my-1">
                                    +00 123 456 7890
                                </Link>
                            </div>
                        </div>
                    </Col>

                    <Col md={4}>
                        <div className="d-flex px-md-1 px-lg-5 mb-md-0 mb-3">
                            <span className="bg-soft-primary avatar avatar-sm rounded icon icon-with-bg icon-xs text-info me-3 flex-shrink-0">
                                <FeatherIcon icon="map-pin" className="icon-dual-primary" />
                            </span>
                            <div className="flex-grow-1">
                                <h5 className="m-0 fw-medium">Address</h5>
                                <Link to="#" className="text-muted fw-normal h5 my-1">
                                    565 Brrom Str, NY
                                </Link>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default ContactUs;
