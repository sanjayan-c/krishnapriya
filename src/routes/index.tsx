import React, { Suspense } from 'react';
import { useRoutes, Navigate } from 'react-router-dom';

// Lazy-loaded components
const Home = React.lazy(() => import('../components/pages/Home'));
const Login = React.lazy(() => import('../components/pages/Login'));
const Dashboard = React.lazy(() => import('../components/pages/Dashboard'));
const PortfolioMasonry = React.lazy(() => import('../components/pages/PortfolioMasonry'));
const Article = React.lazy(() => import('../components/pages/Article'));
const Exhibition = React.lazy(() => import('../components/pages/Exhibition'));
const ManageArticle = React.lazy(() => import('../components/pages/ManageArticle'));
const ManageExhibition = React.lazy(() => import('../components/pages/ManageExhibition'));
const ManageGallery = React.lazy(() => import('../components/pages/ManageGallery'));
const AddArticle = React.lazy(() => import('../components/pages/AddArticle'));
const EditArticle = React.lazy(() => import('../components/pages/EditArticle'));
const AddExhibition = React.lazy(() => import('../components/pages/AddExhibition'));
const EditExhibition = React.lazy(() => import('../components/pages/EditExhibition'));
const AddGallery = React.lazy(() => import('../components/pages/AddGallery'));
const EditGallery = React.lazy(() => import('../components/pages/EditGallery'));

// Fallback loading component
const Loading = () => <div>Loading...</div>;

type LoadComponentProps = {
    component: React.LazyExoticComponent<() => JSX.Element>;
};

const LoadComponent: React.FC<LoadComponentProps> = ({ component: Component }) => (
    <Suspense fallback={<Loading />}>
        <Component />
    </Suspense>
);

const AllRoutes: React.FC = () => {
    return useRoutes([
        {
            path: '/',
            children: [
                {
                    path: '',
                    element: <LoadComponent component={Home} />,
                },
                {
                    path: 'login',
                    element: <LoadComponent component={Login} />,
                },
                {
                    path: 'dashboard',
                    element: <LoadComponent component={Dashboard} />,
                },
                {
                    path: 'gallery',
                    element: <LoadComponent component={PortfolioMasonry} />,
                },
                {
                    path: 'article',
                    element: <LoadComponent component={Article} />
                },
                {
                    path: 'exhibition',
                    element: <LoadComponent component={Exhibition} />
                },
                {
                    path: 'manage-articles',
                    element: <LoadComponent component={ManageArticle} />
                },
                {
                    path: 'add-articles',
                    element: <LoadComponent component={AddArticle} />
                },
                {
                    path: 'edit-articles/:id',
                    element: <LoadComponent component={EditArticle} />
                },
                {
                    path: 'manage-exhibition',
                    element: <LoadComponent component={ManageExhibition} />
                },
                {
                    path: 'add-exhibition',
                    element: <LoadComponent component={AddExhibition} />
                },
                {
                    path: 'edit-exhibition/:id',
                    element: <LoadComponent component={EditExhibition} />
                },
                {
                    path: 'manage-gallery',
                    element: <LoadComponent component={ManageGallery} />
                },
                {
                    path: 'add-gallery',
                    element: <LoadComponent component={AddGallery} />
                },
                {
                    path: 'edit-gallery/:id',
                    element: <LoadComponent component={EditGallery} />
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
