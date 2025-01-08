import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';

type ArticleFormData = {
    title: string;
    description: string;
    date: string;
    link: string;
    image?: FileList;
};

const EditArticle: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { register, handleSubmit, reset } = useForm<ArticleFormData>();
    const navigate = useNavigate();

    useEffect(() => {
        fetchArticle();
    }, []);

    const fetchArticle = async () => {
        const response = await axios.get(`http://localhost:8070/api/articles/${id}`);
        reset(response.data);
    };

    const onSubmit = async (data: ArticleFormData) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('date', data.date);
        formData.append('link', data.link);
        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]);
        }

        await axios.put(`http://localhost:8070/api/articles/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        navigate('/articles');
    };

    return (
        <div>
            <h1>Edit Article</h1>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" {...register('title')} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" {...register('description')} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control type="date" {...register('date')} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Link</Form.Label>
                    <Form.Control type="text" {...register('link')} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Image</Form.Label>
                    <Form.Control type="file" {...register('image')} />
                </Form.Group>
                <Button type="submit">Update Article</Button>
            </Form>
        </div>
    );
};

export default EditArticle;
