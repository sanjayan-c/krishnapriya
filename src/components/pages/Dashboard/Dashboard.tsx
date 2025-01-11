import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Interfaces
interface Gallery {
    id: string; // Change to `_id` and set it as string
    title: string;
    description: string;
    image: string;
}

interface Exhibition {
    id: string; // Change to `_id` and set it as string
    title: string;
    description: string;
    date: string;
    images: string[];
}

interface Article {
    id: string; // Change to `_id` and set it as string
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

    const baseUrl = process.env.REACT_APP_BASE_URL;
    const apiBase = `${baseUrl}/api`;

    useEffect(() => {
        fetchData();
    }, [currentTab]);

    const fetchData = async () => {
        const endpoint = currentTab === 'gallery' ? 'galleries' : currentTab === 'exhibition' ? 'exhibitions' : 'articles';
        const response = await axios.get(`${apiBase}/${endpoint}`);
    
        if (currentTab === 'gallery') {
            setGalleries(response.data); // Use `_id` as provided by the backend
        } else if (currentTab === 'exhibition') {
            setExhibitions(response.data);
        } else {
            setArticles(response.data);
        }
    };
    

    const schemaResolver = yupResolver(
        yup.object().shape({
            title: yup.string().required('Please enter a title'),
            description: yup.string().required('Please enter a description'),
            date: yup.date().optional(),
            image: yup.mixed().optional(),
            images: yup.mixed().optional(),
            link: yup.string().url('Please enter a valid link').optional(),
        })
    );

    const methods = useForm<any>({
        resolver: schemaResolver,
        defaultValues: editingItem || {},
    });

    const { handleSubmit, register, reset, setValue, formState: { errors } } = methods;

    const onSubmit = async (data: any) => {
        const endpoint = currentTab === 'gallery' ? 'galleries' : currentTab === 'exhibition' ? 'exhibitions' : 'articles';
    
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
    
        if (currentTab !== 'gallery') {
            formData.append('date', data.date || '');
        }
    
        if (currentTab === 'article') {
            alert("Function called")
            formData.append('link', data.link || ''); // Append the link field
        }
    
        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]); // Append the image file for articles
        }
    
        if (currentTab === 'exhibition' && data.images && data.images.length > 0) {
            Array.from(data.images).forEach((file: any) => formData.append('images', file));
        }
    
        try {
            if (editingItem && editingItem.id) {
                // Update an existing article
                await axios.put(`${apiBase}/${endpoint}/${editingItem.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                // Add a new article
                await axios.post(`${apiBase}/${endpoint}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            reset();
            setEditingItem(null);
            fetchData();
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };
    
    

    const handleEdit = (item: any) => {
        setEditingItem(item);
        reset(item);
    };

    const handleDelete = async (item: any) => {
        console.log('Deleting item with ID:', item); // Debug log
    
        const endpoint = currentTab === 'gallery' ? 'galleries' : currentTab === 'exhibition' ? 'exhibitions' : 'articles';
        try {
            await axios.delete(`${apiBase}/${endpoint}/${item._id}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting data:', error);
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
                            const gallery = item as Gallery; // Narrow the type to Gallery
                            return (
                                <tr key={gallery.id}>
                                    <td>{index + 1}</td>
                                    <td>{gallery.title}</td>
                                    <td>{gallery.description}</td>
                                    <td>
                                        <img
                                            src={`data:image/png;base64,${gallery.image}`}
                                            alt={gallery.title}
                                            style={{ maxWidth: '100px', maxHeight: '50px' }}
                                        />
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleEdit(gallery)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(gallery)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            );
                        } else if (currentTab === 'exhibition') {
                            const exhibition = item as Exhibition; // Narrow the type to Exhibition
                            return (
                                <tr key={exhibition.id}>
                                    <td>{index + 1}</td>
                                    <td>{exhibition.title}</td>
                                    <td>{exhibition.description}</td>
                                    <td>{exhibition.date}</td>
                                    <td>
                                        {exhibition.images?.map((img, i) => (
                                            <img
                                                key={i}
                                                src={`data:image/png;base64,${img}`}
                                                alt={`Exhibition ${i}`}
                                                style={{ maxWidth: '50px', maxHeight: '50px', marginRight: '5px' }}
                                            />
                                        ))}
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleEdit(exhibition)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(exhibition)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            );
                        } else if (currentTab === 'article') {
                            const article = item as Article; // Narrow the type to Article
                            return (
                                <tr key={article.id}>
                                    <td>{index + 1}</td>
                                    <td>{article.title}</td>
                                    <td>{article.description}</td>
                                    <td>{article.date}</td>
                                    <td>
                                        <a href={article.link} target="_blank" rel="noopener noreferrer">
                                            {article.link}
                                        </a>
                                    </td>
                                    <td>
                                        <img
                                            src={`data:image/png;base64,${article.image}`}
                                            alt={article.title}
                                            style={{ maxWidth: '100px', maxHeight: '50px' }}
                                        />
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => handleEdit(article)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDelete(article)}
                                        >
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
        <Container>
            <Row>
                <Col className="text-center mb-5">
                    <h1>Dashboard Management</h1>
                    <Button onClick={() => setCurrentTab('gallery')} className="me-2">Manage Galleries</Button>
                    <Button onClick={() => setCurrentTab('exhibition')} className="me-2">Manage Exhibitions</Button>
                    <Button onClick={() => setCurrentTab('article')}>Manage Articles</Button>
                </Col>
            </Row>
            <Row>
                <Col lg={8} className="mx-auto">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <input type="text" placeholder="Title" {...register('title')} className={`form-control mb-3 ${errors.title ? 'is-invalid' : ''}`} />
                        <textarea placeholder="Description" {...register('description')} className={`form-control mb-3 ${errors.description ? 'is-invalid' : ''}`} />
                        {currentTab !== 'gallery' && (
                            <input type="date" {...register('date')} className={`form-control mb-3 ${errors.date ? 'is-invalid' : ''}`} />
                        )}
                        {(currentTab === 'gallery' || currentTab === 'article') && (
                            <input type="file" {...register('image')} className="form-control mb-3" />
                        )}
                        {currentTab === 'exhibition' && (
                            <input type="file" {...register('images')} multiple className="form-control mb-3" />
                        )}
                        {currentTab === 'article' && (
                            <input type="text" placeholder="Link" {...register('link')} className="form-control mb-3" />
                        )}
                        <Button type="submit">{editingItem ? 'Update' : 'Add'}</Button>
                    </form>
                </Col>
            </Row>
            <Row className="mt-5">
                <Col>{renderList()}</Col>
            </Row>
        </Container>
    );
};

export default Dashboard;
