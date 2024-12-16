import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';

// components
import Root from './Root';

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
            // root route
            path: '/',
            element: <Root />,
        },
        {
            // public routes
            path: '/',
            children: [
                {
                    path: 'home',
                    element: <LoadComponent component={Home} />,
                },
            ],
        },
    ]);
};

export default AllRoutes;
