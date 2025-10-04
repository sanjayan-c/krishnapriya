import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import FeatherIcon from 'feather-icons-react';
import {
    Button,
    Card,
    Col,
    Container,
    Form,
    InputGroup,
    Modal,
    OverlayTrigger,
    Row,
    Table,
    Tooltip,
} from 'react-bootstrap';
import AdminNavbar from 'components/navbars/AdminNavbar';
import Loading from 'components/Loading';
import placeholder from 'assets/images/photos/no_image_placeholder.png';
import api from 'utils/http';

type Article = {
    _id: string;
    link: string;
    createdAt?: string;
    updatedAt?: string;
};

type ArticleFormValues = {
    link: string;
};

type SortDir = 'asc' | 'desc';

type Meta = {
    title?: string;
    image?: string;
    date?: string;
};

const PAGE_SIZE = 10;

export default function Index() {
    const baseUrl = process.env.REACT_APP_BASE_URL;

    // Data
    const [items, setItems] = useState<Article[]>([]);
    const [metaMap, setMetaMap] = useState<Record<string, Meta>>({}); // _id -> metadata

    // Fetch state
    const [loading, setLoading] = useState(false);
    const [pageError, setPageError] = useState<string | null>(null);

    // UI state
    const [q, setQ] = useState('');

    // Sort (by link hostname currently)
    type SortKey = 'updatedAt' | 'link';
    const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    // Pagination
    const [page, setPage] = useState(1);

    // Create/Edit Modal
    const [showEdit, setShowEdit] = useState(false);
    const [editingItem, setEditingItem] = useState<Article | null>(null);
    const [formValues, setFormValues] = useState<ArticleFormValues>({ link: '' });
    const [modalError, setModalError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const dirtyRef = useRef(false);

    // Delete confirm
    const [showDelete, setShowDelete] = useState(false);
    const [deletingItem, setDeletingItem] = useState<Article | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Compact (mobile/tablet) detection for truncation
    const [isCompact, setIsCompact] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth < 992 : true);
    useEffect(() => {
        const onResize = () => setIsCompact(window.innerWidth < 992);
        window.addEventListener('resize', onResize, { passive: true });
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const limitForCompact = (text: string, max = 200) => {
        if (!isCompact) return text;
        if (!text) return '';
        return text.length > max ? text.slice(0, max).trim() + '…' : text;
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return '';
        }
    };

    // ---- Helpers ----
    function normalizeUrl(value: string) {
        const v = value.trim();
        if (!v) return v;
        if (/^https?:\/\//i.test(v)) return v;
        return `https://${v}`;
    }
    function isValidUrl(value: string) {
        try {
            new URL(normalizeUrl(value));
            return true;
        } catch {
            return false;
        }
    }
    function getHostname(value: string) {
        try {
            const u = new URL(normalizeUrl(value));
            return u.hostname.toLowerCase();
        } catch {
            return '';
        }
    }
    const titleFallback = (link: string) => {
        const host = getHostname(link);
        return host || 'Article';
    };

    // ---- Fetch items ----
    const fetchItems = async () => {
        try {
            setLoading(true);
            setPageError(null);
            const { data } = await axios.get(`${baseUrl}/api/articles`);
            const list: Article[] = Array.isArray(data) ? data : data.items ?? [];
            setItems(list);
        } catch (err: any) {
            setPageError(err?.response?.data?.message || 'Failed to load articles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- Fetch metadata for each item (runs after items load) ----
    useEffect(() => {
        if (!items.length) return;

        const controller = new AbortController();

        (async () => {
            const pending = items.filter((it) => !metaMap[it._id]);
            if (!pending.length) return;

            await Promise.all(
                pending.map(async (it) => {
                    try {
                        const { data } = await axios.get(`${baseUrl}/api/articles/metadata`, {
                            params: { url: it.link },
                            signal: controller.signal as any,
                        });
                        setMetaMap((prev) => ({
                            ...prev,
                            [it._id]: {
                                title: data?.title || undefined,
                                image: data?.image || undefined,
                                date: data?.date || undefined,
                            },
                        }));
                    } catch {
                        // Store a minimal fallback to avoid re-fetching in future renders
                        setMetaMap((prev) => ({
                            ...prev,
                            [it._id]: { title: undefined, image: undefined, date: undefined },
                        }));
                    }
                })
            );
        })();

        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    // ---- Filter + sort ----
    const processed = useMemo(() => {
        let list = [...items];

        if (q.trim()) {
            const n = q.trim().toLowerCase();
            list = list.filter((it) => {
                const host = getHostname(it.link);
                const meta = metaMap[it._id];
                const title = (meta?.title || '').toLowerCase();
                return it.link?.toLowerCase().includes(n) || host.includes(n) || title.includes(n);
            });
        }

        list.sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;

            if (sortKey === 'updatedAt') {
                const av = a.updatedAt || '';
                const bv = b.updatedAt || '';
                if (av < bv) return -1 * dir;
                if (av > bv) return 1 * dir;
                return 0;
            }

            // fallback: link/hostname
            const av = getHostname(a.link) || a.link.toLowerCase();
            const bv = getHostname(b.link) || b.link.toLowerCase();
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return 0;
        });

        return list;
    }, [items, q, sortDir, metaMap]);

    // Pagination derived
    const pages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
    const paged = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return processed.slice(start, start + PAGE_SIZE);
    }, [processed, page]);

    useEffect(() => {
        if (page > pages) setPage(1);
    }, [pages, page]);

    const toggleSort = () => {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    };

    // ---- Modal helpers ----
    const resetForm = () => {
        setFormValues({ link: '' });
        setModalError(null);
        dirtyRef.current = false;
    };

    const openCreate = () => {
        setEditingItem(null);
        resetForm();
        setShowEdit(true);
    };

    const openEdit = (it: Article) => {
        setEditingItem(it);
        setFormValues({ link: it.link || '' });
        setModalError(null);
        dirtyRef.current = false;
        setShowEdit(true);
    };

    const handleCloseEdit = () => {
        if (isSaving) return; // block while saving
        setShowEdit(false);
        setEditingItem(null);
        resetForm();
    };

    const onChangeField = (key: keyof ArticleFormValues, value: any) => {
        dirtyRef.current = true;
        setFormValues((s) => ({ ...s, [key]: value }));
    };

    const submitCreateOrUpdate = async () => {
        if (!formValues.link.trim()) {
            setModalError('Link is required.');
            return;
        }
        if (!isValidUrl(formValues.link)) {
            setModalError('Please enter a valid URL (e.g., https://example.com/article).');
            return;
        }

        try {
            setIsSaving(true);
            setModalError(null);

            const payload = { link: normalizeUrl(formValues.link) };

            if (editingItem) {
                const { data } = await api.put(`${baseUrl}/api/articles/${editingItem._id}`, payload);
                setItems((prev) => prev.map((x) => (x._id === data._id ? data : x)));
                // refresh metadata for this item
                setMetaMap((prev) => {
                    const copy = { ...prev };
                    delete copy[editingItem._id];
                    return copy;
                });
            } else {
                const { data } = await api.post(`${baseUrl}/api/articles`, payload);
                setItems((prev) => [data, ...prev]);
            }

            setShowEdit(false);
            resetForm();
            dirtyRef.current = false;
        } catch (err: any) {
            setModalError(err?.response?.data?.message || 'Save failed');
        } finally {
            setIsSaving(false);
        }
    };

    // ---- Delete ----
    const confirmDelete = (it: Article) => {
        setDeletingItem(it);
        setShowDelete(true);
    };

    const doDelete = async () => {
        if (!deletingItem) return;
        try {
            setIsDeleting(true);
            await api.delete(`${baseUrl}/api/articles/${deletingItem._id}`);
            setItems((prev) => prev.filter((x) => x._id !== deletingItem._id));
            setShowDelete(false);
            setDeletingItem(null);
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Delete failed');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <AdminNavbar isSticky={false} />

            <Container className="py-4">
                {/* Toolbar */}
                <Row className="align-items-center mb-3 gy-2">
                    {/* Search */}
                    <Col xs={12} md={8} className="d-flex">
                        <div className="search-max flex-grow-1 w-100">
                            <InputGroup className="w-100">
                                <InputGroup.Text>
                                    <FeatherIcon icon="search" size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search title, URL or hostname…"
                                    value={q}
                                    onChange={(e) => {
                                        setQ(e.target.value);
                                        setPage(1);
                                    }}
                                />
                            </InputGroup>
                        </div>
                    </Col>

                    {/* Button */}
                    <Col xs={12} md={4} className="text-end">
                        <div className="btn-max d-inline-block">
                            <Button onClick={openCreate}>
                                <FeatherIcon icon="plus" className="me-2" />
                                New
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Page-level fetch errors */}
                {pageError && (
                    <div className="alert alert-danger py-2 d-flex align-items-center">
                        <FeatherIcon icon="alert-triangle" className="me-2" />
                        <span>{pageError}</span>
                    </div>
                )}

                {/* Loading or Table */}
                {loading && items.length === 0 ? (
                    <section
                        className="section pt-5 pb-5 d-flex justify-content-center align-items-center"
                        style={{ minHeight: '300px' }}>
                        <Loading style={{ width: 100, height: 100 }} />
                    </section>
                ) : (
                    <Card className="shadow-sm">
                        <Card.Body>
                            <div className="table-responsive">
                                <Table hover className="align-middle">
                                    <thead>
                                        <tr>
                                            <th style={{ width: 86 }}>Image</th>
                                            <th
                                                role="button"
                                                onClick={toggleSort}
                                                className="user-select-none col-article">
                                                <span className="me-1">Article</span>
                                                <FeatherIcon icon={sortDir === 'asc' ? 'chevron-up' : 'chevron-down'} />
                                            </th>
                                            <th style={{ width: 90 }} className="text-end">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {processed.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center py-4 text-muted">
                                                    No items
                                                </td>
                                            </tr>
                                        ) : (
                                            paged.map((it) => {
                                                const meta = metaMap[it._id] || {};
                                                const imgSrc = meta.image || placeholder;
                                                const title = meta.title || titleFallback(it.link);
                                                const dateStr = formatDate(meta.date);
                                                const host = getHostname(it.link);

                                                return (
                                                    <tr key={it._id}>
                                                        {/* Image */}
                                                        <td>
                                                            <div className="ratio ratio-1x1" style={{ width: 70 }}>
                                                                <img
                                                                    src={imgSrc}
                                                                    alt={title}
                                                                    style={{
                                                                        objectFit: 'cover',
                                                                        width: '100%',
                                                                        borderRadius: 6,
                                                                    }}
                                                                />
                                                            </div>
                                                        </td>

                                                        {/* Text + Date */}
                                                        <td className="col-article">
                                                            <div className="fw-semibold truncate-lg">{title}</div>
                                                            {dateStr && (
                                                                <div className="text-muted small">{dateStr}</div>
                                                            )}
                                                            <div className="text-muted small">
                                                                <a
                                                                    href={normalizeUrl(it.link)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-decoration-underline"
                                                                    title={it.link}>
                                                                    {host || limitForCompact(it.link)}
                                                                </a>
                                                            </div>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="text-end text-nowrap admin-actions">
                                                            <div className="d-inline-flex align-items-center gap-2">
                                                                <OverlayTrigger
                                                                    overlay={<Tooltip>Edit</Tooltip>}
                                                                    placement="top">
                                                                    <Button
                                                                        variant="link"
                                                                        className="text-primary p-0"
                                                                        onClick={() => openEdit(it)}>
                                                                        <FeatherIcon icon="edit-2" />
                                                                    </Button>
                                                                </OverlayTrigger>
                                                                <OverlayTrigger
                                                                    overlay={<Tooltip>Delete</Tooltip>}
                                                                    placement="top">
                                                                    <Button
                                                                        variant="link"
                                                                        className="text-danger p-0"
                                                                        onClick={() => confirmDelete(it)}>
                                                                        <FeatherIcon icon="trash-2" />
                                                                    </Button>
                                                                </OverlayTrigger>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {pages > 1 && (
                                <div className="d-flex justify-content-between align-items-center pt-2">
                                    <div className="text-muted small">
                                        Showing {(page - 1) * PAGE_SIZE + 1}–
                                        {Math.min(page * PAGE_SIZE, processed.length)} of {processed.length}
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline-secondary"
                                            disabled={page <= 1}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                            <FeatherIcon icon="chevron-left" className="me-1" /> Prev
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-secondary"
                                            disabled={page >= pages}
                                            onClick={() => setPage((p) => Math.min(pages, p + 1))}>
                                            Next <FeatherIcon icon="chevron-right" className="ms-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                )}
            </Container>

            {/* Create/Edit Modal (only Link field) */}
            <Modal
                show={showEdit}
                onHide={handleCloseEdit}
                centered
                backdrop={isSaving ? 'static' : true}
                keyboard={!isSaving}>
                <Modal.Header closeButton={!isSaving}>
                    <Modal.Title>{editingItem ? 'Edit Article Link' : 'Add New Article Link'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Modal-scoped errors */}
                    {modalError && (
                        <div className="alert alert-danger py-2 d-flex align-items-center">
                            <FeatherIcon icon="alert-triangle" className="me-2" />
                            <span>{modalError}</span>
                        </div>
                    )}

                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!isSaving) submitCreateOrUpdate();
                        }}>
                        <Form.Group className="mb-3">
                            <Form.Label>Link *</Form.Label>
                            <Form.Control
                                type="url"
                                placeholder="https://example.com/article"
                                value={formValues.link}
                                onChange={(e) => onChangeField('link', e.target.value)}
                                required
                                disabled={isSaving}
                            />
                            <Form.Text className="text-muted">
                                Include <code>https://</code> or <code>http://</code>. We’ll add it if you forget.
                            </Form.Text>
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="light" onClick={handleCloseEdit} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && (
                                    <span
                                        className="spinner-border spinner-border-sm me-2"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                )}
                                {editingItem ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete confirm */}
            <Modal
                show={showDelete}
                onHide={() => (isDeleting ? undefined : setShowDelete(false))}
                centered
                backdrop={isDeleting ? 'static' : true}
                keyboard={!isDeleting}>
                <Modal.Header closeButton={!isDeleting}>
                    <Modal.Title>Delete Article Link</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this link?
                    <br />
                    <span className="text-muted small">{deletingItem?.link}</span>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowDelete(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={doDelete} disabled={isDeleting}>
                        {isDeleting && (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        )}
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Styles */}
            <style>{`
  /* Desktop (≥992px): cap BOTH search and button widths */
  @media (min-width: 992px) {
    .search-max { max-width: 560px; }
    .btn-max    { max-width: 220px; }
  }
  /* Tablets & mobile (<992px): cap ONLY the button; search is fluid */
  @media (max-width: 991.98px) {
    .btn-max { max-width: 280px; }
    .search-max { max-width: none; }
  }

  .table td, .table th { vertical-align: middle !important; }
  thead th[role="button"] { cursor: pointer; }

  .col-article { white-space: normal; }
  .truncate-lg {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: bottom;
  }

  @media (max-width: 991.98px) {
    .col-article { min-width: 320px; }
    .admin-actions .btn { padding: 0 .25rem; }
  }

  @media (min-width: 992px) {
    .col-article { max-width: 560px; }
  }
`}</style>
        </>
    );
}
