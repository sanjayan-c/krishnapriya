import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';

// Define form data type
type ExhibitionFormData = {
    title: string;
    description: string;
    date: string;
    images?: FileList;
};

const EditExhibition: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { register, handleSubmit, reset } = useForm<ExhibitionFormData>();
    const navigate = useNavigate();

    useEffect(() => {
        fetchExhibition();
    }, []);

    const fetchExhibition = async () => {
        const response = await axios.get(`http://localhost:8070/api/exhibitions/${id}`);
        reset(response.data);
    };

    const onSubmit = async (data: ExhibitionFormData) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('date', data.date);
        if (data.images) {
            Array.from(data.images).forEach((file) => formData.append('images', file));
        }

        await axios.put(`http://localhost:8070/api/exhibitions/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        navigate('/manage-exhibition');
    };

    return (
        <div>
            <h1>Edit Exhibition</h1>
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
                <Button type="submit">Update Exhibition</Button>
            </Form>
        </div>
    );
};

export default EditExhibition;
