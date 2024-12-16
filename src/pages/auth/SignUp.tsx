import { Link, Navigate } from 'react-router-dom';
import { Button, Row, Col, Alert } from 'react-bootstrap';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import FeatherIcon from 'feather-icons-react';

// hooks
import { useSignup } from '../../hooks/auth';

// components
import { VerticalForm, FormInput } from '../../components/form';

import AuthLayout from './AuthLayout';

type UserData = {
    exampleName: string;
    email: string;
    password: string;
};

const SignUp = () => {
    const { t } = useTranslation();
    const [user, error, signup] = useSignup();

    /*
    form validation schema
    */
    const schemaResolver = yupResolver(
        yup.object().shape({
            exampleName: yup.string().required(t('Please enter Name')),
            email: yup.string().required(t('Please enter Email')).email(t('Please enter valid Email')),
            password: yup.string().required(t('Please enter Password')),
        })
    );

    /*
    handle form submission
    */
    const onSubmit = (formData: UserData) => {
        signup!({ fullname: formData['exampleName'], email: formData['email'], password: formData['password'] });
    };

    return (
        <>
            {user && <Navigate to="/auth/confirm" replace />}
            <AuthLayout
                hasSlider
                bottomLinks={
                    <p className="text-muted">
                        {t('Already have an account?')}
                        <Link to="/auth/login" className="text-primary fw-semibold ms-1">
                            {t('Log In')}
                        </Link>
                    </p>
                }
            >
                <h6 className="h5 mb-0 mt-3">{t('Create Your Account')}</h6>
                <p className="text-muted mt-1 mb-4">
                    {t("Don't have an account? Create your account, it takes less than a minute.")}
                </p>

                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}

                <VerticalForm<UserData> onSubmit={onSubmit} resolver={schemaResolver} defaultValues={{}}>
                    <FormInput
                        type="text"
                        name="exampleName"
                        label={t('Your Name')}
                        placeholder={t('Your Name')}
                        containerClass={'mb-3'}
                    />
                    <FormInput
                        type="email"
                        name="email"
                        label={t('Email')}
                        placeholder={t('Email')}
                        containerClass={'mb-3'}
                    />
                    <FormInput
                        label={t('Password')}
                        type="password"
                        name="password"
                        placeholder={t('Enter your password')}
                        containerClass={'mb-3'}
                    />
                    <div className="mb-0 text-center d-grid">
                        <Button type="submit">{t('Register')}</Button>
                    </div>
                </VerticalForm>

                <div className="py-3 text-center">
                    <span className="fs-13 fw-bold">{t('OR')}</span>
                </div>
                <Row>
                    <Col xs={12} className="text-center">
                        <Link to="#" className="btn btn-white w-100">
                            <FeatherIcon icon="github" className="icon icon-xs me-2" />
                            {t('Sign Up with Github')}
                        </Link>
                    </Col>
                </Row>
            </AuthLayout>
        </>
    );
};

export default SignUp;
