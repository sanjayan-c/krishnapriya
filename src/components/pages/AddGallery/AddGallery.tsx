import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';

// Define form data type
type GalleryFormData = {
    title: string;
    description: string;
};

const AddGallery: React.FC = () => {
    const { register, handleSubmit, reset } = useForm<GalleryFormData>();
    const navigate = useNavigate();

    const onSubmit = async (data: GalleryFormData) => {
        await axios.post('http://localhost:8070/api/galleries', data);
        reset();
        navigate('/galleries');
    };

    return (
        <div>
            <h1>Add Gallery</h1>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" {...register('title')} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" {...register('description')} />
                </Form.Group>
                <Button type="submit">Add Gallery</Button>
            </Form>
        </div>
    );
};

export default AddGallery;
