import { Link, Navigate, useLocation } from 'react-router-dom';
import { Button, Row, Col, Alert } from 'react-bootstrap';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import FeatherIcon from 'feather-icons-react';

// hooks
import { useLogin } from '../../hooks/auth';

// components
import { VerticalForm, FormInput } from '../../components/form';

import AuthLayout from './AuthLayout';

type LocationState = {
    from: {
        pathname: string;
    };
};

type UserData = {
    email: string;
    password: string;
};

const Login = () => {
    const { t } = useTranslation();
    const [user, error, login] = useLogin();

    /*
    form validation schema
    */
    const schemaResolver = yupResolver(
        yup.object().shape({
            email: yup.string().required(t('Please enter Email')).email(t('Please enter valid Email')),
            password: yup.string().required(t('Please enter Password')),
        })
    );

    /*
    handle form submission
    */
    const onSubmit = (formData: UserData) => {
        login!({ email: formData['email'], password: formData['password'] });
    };

    const location = useLocation();
    let redirectUrl = '/';

    if (location.state) {
        const { from } = location.state as LocationState;
        redirectUrl = from ? from.pathname : '/';
    }

    return (
        <>
            {user && <Navigate to={redirectUrl} replace />}
            <AuthLayout
                hasSlider
                bottomLinks={
                    <p className="text-muted">
                        {t("Don't have an account?")}
                        <Link to="/auth/signup" className="text-primary fw-semibold ms-1">
                            {t('Sign Up')}
                        </Link>
                    </p>
                }
            >
                <h6 className="h5 mb-0 mt-3">{t('Welcome back!')}</h6>
                <p className="text-muted mt-1 mb-4">
                    {t('Enter your email address and password to access admin panel.')}
                </p>

                {error && (
                    <Alert variant="danger" className="mb-3">
                        {error}
                    </Alert>
                )}

                <VerticalForm<UserData>
                    onSubmit={onSubmit}
                    resolver={schemaResolver}
                    defaultValues={{ email: 'prompt@coderthemes.com', password: 'test' }}
                >
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
                        placeholder={t('Password')}
                        action={
                            <Link
                                to="/auth/forget-password"
                                className="float-end text-muted text-unline-dashed ms-1 fs-13"
                            >
                                {t('Forgot your password?')}
                            </Link>
                        }
                        containerClass={'mb-3'}
                    />

                    <FormInput
                        type="checkbox"
                        name="checkbox"
                        label={t('Remember me')}
                        containerClass={'mb-3'}
                        defaultChecked
                    />

                    <div className="mb-0 text-center d-grid">
                        <Button type="submit">{t('Log In')}</Button>
                    </div>
                </VerticalForm>

                <div className="py-3 text-center">
                    <span className="fs-13 fw-bold">{t('OR')}</span>
                </div>
                <Row>
                    <Col xs={12} className="text-center">
                        <Link to="#" className="btn btn-white w-100">
                            <FeatherIcon icon="github" className="icon icon-xs me-2" />
                            {t('Github')}
                        </Link>
                    </Col>
                </Row>
            </AuthLayout>
        </>
    );
};

export default Login;
