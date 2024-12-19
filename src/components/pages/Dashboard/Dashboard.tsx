import React, { useState } from 'react';
import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FeatherIcon from 'feather-icons-react';

// Interfaces
interface Gallery {
    id: number;
    title: string;
    description: string;
    image: string;
}

interface Exhibition {
    id: number;
    title: string;
    description: string;
    date: string;
    images: string[];
}

interface Article {
    id: number;
    title: string;
    description: string;
    date: string;
    image: string;
    link: string;
}

const Dashboard = () => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [currentTab, setCurrentTab] = useState<'gallery' | 'exhibition' | 'article'>('gallery');

    // Form validation schema
    const schemaResolver = yupResolver(
        yup.object().shape({
            title: yup.string().required('Please enter a title'),
            description: yup.string().required('Please enter a description'),
            date: yup.date().typeError('Please enter a valid date').optional(),
            image: yup.string().url('Please enter a valid image URL').optional(),
            images: yup.array().of(yup.string().url()).optional(),
            link: yup.string().url('Please enter a valid link').optional(),
        })
    );

    const methods = useForm<any>({
        resolver: schemaResolver,
        defaultValues: editingItem || {},
    });

    const {
        handleSubmit,
        register,
        reset,
        formState: { errors },
    } = methods;

    const onSubmit = (data: any) => {
        if (editingItem) {
            if (currentTab === 'gallery') {
                setGalleries((prev) => prev.map((item) => (item.id === editingItem.id ? { ...editingItem, ...data } : item)));
            } else if (currentTab === 'exhibition') {
                setExhibitions((prev) => prev.map((item) => (item.id === editingItem.id ? { ...editingItem, ...data } : item)));
            } else {
                setArticles((prev) => prev.map((item) => (item.id === editingItem.id ? { ...editingItem, ...data } : item)));
            }
        } else {
            const newItem = { id: Date.now(), ...data };
            if (currentTab === 'gallery') {
                setGalleries((prev) => [...prev, newItem]);
            } else if (currentTab === 'exhibition') {
                setExhibitions((prev) => [...prev, newItem]);
            } else {
                setArticles((prev) => [...prev, newItem]);
            }
        }
        reset();
        setEditingItem(null);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        reset(item);
    };

    const handleDelete = (id: number) => {
        if (currentTab === 'gallery') {
            setGalleries((prev) => prev.filter((item) => item.id !== id));
        } else if (currentTab === 'exhibition') {
            setExhibitions((prev) => prev.filter((item) => item.id !== id));
        } else {
            setArticles((prev) => prev.filter((item) => item.id !== id));
        }
    };

    const renderList = () => {
        const items = currentTab === 'gallery' ? galleries : currentTab === 'exhibition' ? exhibitions : articles;
    
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Description</th>
                        {currentTab !== 'gallery' && <th>Date</th>}
                        {currentTab === 'exhibition' && <th>Images</th>}
                        {currentTab === 'article' && <th>Link</th>}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => {
                        if (currentTab === 'gallery') {
                            const gallery = item as Gallery;
                            return (
                                <tr key={gallery.id}>
                                    <td>{index + 1}</td>
                                    <td>{gallery.title}</td>
                                    <td>{gallery.description}</td>
                                    <td>{gallery.image}</td>
                                    <td>
                                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(gallery)}>
                                            Edit
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(gallery.id)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            );
                        } else if (currentTab === 'exhibition') {
                            const exhibition = item as Exhibition;
                            return (
                                <tr key={exhibition.id}>
                                    <td>{index + 1}</td>
                                    <td>{exhibition.title}</td>
                                    <td>{exhibition.description}</td>
                                    <td>{exhibition.date}</td>
                                    <td>{exhibition.images?.join(', ')}</td>
                                    <td>
                                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(exhibition)}>
                                            Edit
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(exhibition.id)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            );
                        } else {
                            const article = item as Article;
                            return (
                                <tr key={article.id}>
                                    <td>{index + 1}</td>
                                    <td>{article.title}</td>
                                    <td>{article.description}</td>
                                    <td>{article.date}</td>
                                    <td>{article.link}</td>
                                    <td>
                                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(article)}>
                                            Edit
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(article.id)}>
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            );
                        }
                    })}
                </tbody>
            </table>
        );
    };    

    return (
        <section id="dashboard" className="section pb-lg-7 py-4 position-relative">
            <Container>
                <Row>
                    <Col className="text-center">
                        <h1 className="display-5 fw-semibold">Dashboard Management</h1>
                        <div className="my-3">
                            <Button variant="primary" onClick={() => setCurrentTab('gallery')} className="me-2">
                                Manage Galleries
                            </Button>
                            <Button variant="primary" onClick={() => setCurrentTab('exhibition')} className="me-2">
                                Manage Exhibitions
                            </Button>
                            <Button variant="primary" onClick={() => setCurrentTab('article')}>
                                Manage Articles
                            </Button>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col lg={8} className="mx-auto">
                        <Card className="shadow-none">
                            <Card.Body className="p-xl-5 p-0">
                                <h2 className="mb-2 mt-0 fw-medium">{`Manage ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}s`}</h2>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Row>
                                        <Col lg={12}>
                                            <input
                                                type="text"
                                                placeholder="Title"
                                                {...register('title')}
                                                className={`form-control mb-3 ${errors.title ? 'is-invalid' : ''}`}
                                            />
                                            {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                                        </Col>
                                        <Col lg={12}>
                                            <textarea
                                                placeholder="Description"
                                                {...register('description')}
                                                className={`form-control mb-3 ${errors.description ? 'is-invalid' : ''}`}
                                            />
                                            {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                                        </Col>
                                        {currentTab !== 'gallery' && (
                                            <Col lg={6}>
                                                <input
                                                    type="date"
                                                    placeholder="Date"
                                                    {...register('date')}
                                                    className={`form-control mb-3 ${errors.date ? 'is-invalid' : ''}`}
                                                />
                                                {errors.date && <div className="invalid-feedback">{errors.date.message}</div>}
                                            </Col>
                                        )}
                                        {currentTab === 'gallery' && (
                                            <Col lg={12}>
                                                <input
                                                    type="text"
                                                    placeholder="Image URL"
                                                    {...register('image')}
                                                    className={`form-control mb-3 ${errors.image ? 'is-invalid' : ''}`}
                                                />
                                                {errors.image && <div className="invalid-feedback">{errors.image.message}</div>}
                                            </Col>
                                        )}
                                        {currentTab === 'exhibition' && (
                                            <Col lg={12}>
                                                <textarea
                                                    placeholder="Images (comma separated URLs)"
                                                    {...register('images')}
                                                    className={`form-control mb-3 ${errors.images ? 'is-invalid' : ''}`}
                                                />
                                                {errors.images && <div className="invalid-feedback">{errors.images.message}</div>}
                                            </Col>
                                        )}
                                        {currentTab === 'article' && (
                                            <Col lg={12}>
                                                <input
                                                    type="text"
                                                    placeholder="Link"
                                                    {...register('link')}
                                                    className={`form-control mb-3 ${errors.link ? 'is-invalid' : ''}`}
                                                />
                                                {errors.link && <div className="invalid-feedback">{errors.link.message}</div>}
                                            </Col>
                                        )}
                                        <Col lg="auto">
                                            <Button type="submit">
                                                {editingItem ? 'Update' : 'Add'}
                                            </Button>
                                        </Col>
                                    </Row>
                                </form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row className="mt-5">
                    <Col lg={12}>{renderList()}</Col>
                </Row>
            </Container>
        </section>
    );
};

export default Dashboard;
