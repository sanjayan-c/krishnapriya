import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';

// Define Exhibition type
type Exhibition = {
    id: string;
    title: string;
    description: string;
    date: string;
    images: string[]; // Assuming images are returned as URLs
};

const ManageExhibitions: React.FC = () => {
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchExhibitions();
    }, []);

    const fetchExhibitions = async () => {
        const response = await axios.get<Exhibition[]>('http://localhost:8070/api/exhibitions');
        setExhibitions(response.data);
    };

    const handleDelete = async (id: string) => {
        await axios.delete(`http://localhost:8070/api/exhibitions/${id}`);
        fetchExhibitions();
    };

    return (
        <div>
            <h1>Manage Exhibitions</h1>
            <Button onClick={() => navigate('/add-exhibition')} className="mb-3">
                Add New Exhibition
            </Button>

            <Table className="mt-4">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {exhibitions.map((exhibition, index) => (
                        <tr key={exhibition.id}>
                            <td>{index + 1}</td>
                            <td>{exhibition.title}</td>
                            <td>{exhibition.description}</td>
                            <td>{exhibition.date}</td>
                            <td>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate(`/exhibitions/edit/${exhibition.id}`)}
                                    className="me-2"
                                >
                                    Edit
                                </Button>
                                <Button variant="danger" onClick={() => handleDelete(exhibition.id)}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default ManageExhibitions;
