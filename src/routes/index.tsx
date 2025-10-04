// routes/index.tsx
import React, { Suspense, PropsWithChildren } from 'react';
import { useRoutes, Navigate, useLocation } from 'react-router-dom';
import Loading from '../components/Loading/index';
import { isLoggedIn } from '../utils/auth';

// Lazy-loaded components
const Home = React.lazy(() => import('../components/pages/Home'));
const PortfolioMasonry = React.lazy(() => import('../components/pages/PortfolioMasonry'));
const Article = React.lazy(() => import('../components/pages/Article'));
const Exhibition = React.lazy(() => import('../components/pages/Exhibition'));
const AdminGallery = React.lazy(() => import('../components/pages/Admin/Gallery/Index'));
const AdminExhibitions = React.lazy(() => import('../components/pages/Admin/Exhibitions/Index'));
const AdminArticles = React.lazy(() => import('../components/pages/Admin/Articles/Index'));
const AdminTestimonials = React.lazy(() => import('../components/pages/Admin/Testimonials/Index'));
const Login = React.lazy(() => import('../components/pages/Admin/Login/Index'));

type LoadComponentProps = {
    component: React.LazyExoticComponent<() => JSX.Element>;
};

const LoadComponent: React.FC<LoadComponentProps> = ({ component: Component }) => (
    <Suspense
        fallback={
            <section
                className="d-flex justify-content-center align-items-center"
                style={{ height: '100vh', width: '100vw' }}>
                <Loading style={{ width: 500, height: 500 }} />
            </section>
        }>
        <Component />
    </Suspense>
);

/** Simple auth gate for admin routes */
const RequireAuth: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    if (!isLoggedIn()) {
        return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
    }
    return <>{children}</>;
};

const AllRoutes: React.FC = () => {
    return useRoutes([
        {
            path: '/',
            children: [
                { path: '', element: <LoadComponent component={Home} /> },
                { path: 'login', element: <LoadComponent component={Login} /> },
                { path: 'gallery', element: <LoadComponent component={PortfolioMasonry} /> },
                { path: 'articles', element: <LoadComponent component={Article} /> },
                { path: 'exhibitions', element: <LoadComponent component={Exhibition} /> },

                // Admin login lives at /admin
                { path: 'admin', element: <LoadComponent component={Login} /> },

                // Protected admin routes
                {
                    path: 'admin/gallery',
                    element: (
                        <RequireAuth>
                            <LoadComponent component={AdminGallery} />
                        </RequireAuth>
                    ),
                },
                {
                    path: 'admin/exhibitions',
                    element: (
                        <RequireAuth>
                            <LoadComponent component={AdminExhibitions} />
                        </RequireAuth>
                    ),
                },
                {
                    path: 'admin/articles',
                    element: (
                        <RequireAuth>
                            <LoadComponent component={AdminArticles} />
                        </RequireAuth>
                    ),
                },
                {
                    path: 'admin/testimonials',
                    element: (
                        <RequireAuth>
                            <LoadComponent component={AdminTestimonials} />
                        </RequireAuth>
                    ),
                },

                { path: '*', element: <Navigate to="/" replace /> },
            ],
        },
    ]);
};

export default AllRoutes;
