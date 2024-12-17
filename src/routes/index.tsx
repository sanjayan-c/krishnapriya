import React, { Suspense } from 'react';
import { useRoutes, Navigate } from 'react-router-dom';

// home
const Home = React.lazy(() => import('../components/pages/Home'));

const loading = () => <div className=""></div>;

type LoadComponentProps = {
    component: React.LazyExoticComponent<() => JSX.Element>;
};

const LoadComponent = ({ component: Component }: LoadComponentProps) => (
    <Suspense fallback={loading()}>
        <Component />
    </Suspense>
);

const AllRoutes = () => {
    return useRoutes([
        {
            path: '/',
            children: [
                {
                    path: '',
                    element: <LoadComponent component={Home} />,
                },
                {
                    path: '*',
                    element: <Navigate to="/" replace />,
                },
            ],
        },
    ]);
};

export default AllRoutes;
