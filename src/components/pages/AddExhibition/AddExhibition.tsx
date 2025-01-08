import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';

// Define form data type
type ExhibitionFormData = {
    title: string;
    description: string;
    date: string;
    images: FileList;
};

const AddExhibition: React.FC = () => {
    const { register, handleSubmit, reset } = useForm<ExhibitionFormData>();
    const navigate = useNavigate();

    const onSubmit = async (data: ExhibitionFormData) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('date', data.date);
        Array.from(data.images).forEach((file) => formData.append('images', file));

        await axios.post('http://localhost:8070/api/exhibitions', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        reset();
        navigate('/manage-exhibition');
    };

    return (
        <div>
            <h1>Add Exhibition</h1>
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
                    <Form.Label>Images</Form.Label>
                    <Form.Control type="file" multiple {...register('images')} />
                </Form.Group>
                <Button type="submit">Add Exhibition</Button>
            </Form>
        </div>
    );
};

export default AddExhibition;
