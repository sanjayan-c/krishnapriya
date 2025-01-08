import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';

type Article = {
    id: string;
    title: string;
    description: string;
    date: string;
    link: string;
    image: string;
};

const ManageArticles: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        const response = await axios.get<Article[]>('http://localhost:8070/api/articles');
        setArticles(response.data);
    };

    const handleDelete = async (id: string) => {
        await axios.delete(`http://localhost:8070/api/articles/${id}`);
        fetchArticles();
    };

    return (
        <div>
            <h1>Manage Articles</h1>
            <Button onClick={() => navigate('/add-articles')} className="mb-3">
                Add New Article
            </Button>

            <Table className="mt-4">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Link</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {articles.map((article, index) => (
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
                                <Button
                                    variant="primary"
                                    onClick={() => navigate(`edit-articles/${article.id}`)}
                                    className="me-2"
                                >
                                    Edit
                                </Button>
                                <Button variant="danger" onClick={() => handleDelete(article.id)}>
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

export default ManageArticles;
