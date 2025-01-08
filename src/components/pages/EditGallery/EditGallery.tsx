import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';

// Define form data type
type GalleryFormData = {
    title: string;
    description: string;
};

const EditGallery: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { register, handleSubmit, reset } = useForm<GalleryFormData>();
    const navigate = useNavigate();

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        const response = await axios.get(`http://localhost:8070/api/galleries/${id}`);
        reset(response.data);
    };

    const onSubmit = async (data: GalleryFormData) => {
        await axios.put(`http://localhost:8070/api/galleries/${id}`, data);
        navigate('/manage-gallery');
    };

    return (
        <div>
            <h1>Edit Gallery</h1>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" {...register('title')} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" {...register('description')} />
                </Form.Group>
                <Button type="submit">Update Gallery</Button>
            </Form>
        </div>
    );
};

export default EditGallery;
