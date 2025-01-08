import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';

// Define Gallery type
type Gallery = {
    id: string;
    title: string;
    description: string;
};

const ManageGalleries: React.FC = () => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchGalleries();
    }, []);

    const fetchGalleries = async () => {
        const response = await axios.get<Gallery[]>('http://localhost:8070/api/galleries');
        setGalleries(response.data);
    };

    const handleDelete = async (id: string) => {
        await axios.delete(`http://localhost:8070/api/galleries/${id}`);
        fetchGalleries();
    };

    return (
        <div>
            <h1>Manage Galleries</h1>
            <Button onClick={() => navigate('/add-gallery')} className="mb-3">
                Add New Gallery
            </Button>

            <Table className="mt-4">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {galleries.map((gallery, index) => (
                        <tr key={gallery.id}>
                            <td>{index + 1}</td>
                            <td>{gallery.title}</td>
                            <td>{gallery.description}</td>
                            <td>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate(`edit-gallery/${gallery.id}`)}
                                    className="me-2"
                                >
                                    Edit
                                </Button>
                                <Button variant="danger" onClick={() => handleDelete(gallery.id)}>
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

export default ManageGalleries;
