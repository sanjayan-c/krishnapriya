import React from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Define the types for the form data
interface LoginFormInputs {
    email: string;
    password: string;
}

const Login = () => {
    // form validation schema
    const schemaResolver = yupResolver(
        yup.object().shape({
            email: yup.string().required('Please enter your email').email('Enter a valid email'),
            password: yup.string().required('Please enter your password'),
        })
    );

    // form methods
    const methods = useForm<LoginFormInputs>({ resolver: schemaResolver });
    const {
        handleSubmit,
        register,
        control,
        formState: { errors },
    } = methods;

    // handle form submission
    const onSubmit = (data: LoginFormInputs) => {
        console.log('Login Data:', data);
    };

    return (
        <section className="section py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <Card className="shadow-lg">
                            <Card.Body className="p-4">
                                <h3 className="text-center mb-4">Login</h3>
                                <Form onSubmit={handleSubmit(onSubmit)}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter your email"
                                            {...register('email')}
                                            isInvalid={!!errors.email}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder="Enter your password"
                                            {...register('password')}
                                            isInvalid={!!errors.password}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.password?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <div className="d-grid">
                                        <Button type="submit" variant="primary">
                                            Login
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Login;
