import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import FeatherIcon from 'feather-icons-react';
import {
    Button,
    Card,
    Col,
    Container,
    Form,
    Image,
    InputGroup,
    Modal,
    OverlayTrigger,
    Row,
    Table,
    Tooltip,
} from 'react-bootstrap';
import AdminNavbar from 'components/navbars/AdminNavbar';
import Loading from 'components/Loading';
import { LightBox, ImageType } from 'components/LightBox';
import api from 'utils/http';

type Exhibition = {
    _id: string;
    title: string;
    description: string;
    date?: string; // now supports 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'
    images: string[]; // base64 (no data: prefix)
    imageTitle?: string;
    size?: string;
    location?: string;
    createdAt?: string;
    updatedAt?: string;
};

type ExhibitionFormValues = {
    title: string;
    description: string;
    date: string; // stays a string; we'll validate flexible formats
    imageTitle: string;
    size: string;
    location: string;
};

type SortKey = 'title' | 'date' | 'location' | 'updatedAt';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

// Flexible date regex: 'YYYY' or 'YYYY-MM' or 'YYYY-MM-DD'
const DATE_REGEX = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

function isValidPartialDate(value: string) {
    const s = value.trim();
    if (!s) return true; // allow empty
    if (!DATE_REGEX.test(s)) return false;
    // basic range checks for MM/DD when present
    const m = DATE_REGEX.exec(s);
    if (!m) return false;
    const month = m[2] ? Number(m[2]) : null;
    const day = m[3] ? Number(m[3]) : null;
    if (month !== null && (month < 1 || month > 12)) return false;
    if (day !== null && (day < 1 || day > 31)) return false; // simple bound; we’re not validating month/day combo strictly
    return true;
}

function formatDateHuman(value?: string) {
    if (!value) return '';
    const m = DATE_REGEX.exec(value.trim());
    if (!m) return value; // display raw if not matching
    const y = Number(m[1]);
    const mo = m[2] ? Number(m[2]) : null;
    const d = m[3] ? Number(m[3]) : null;
    if (!mo) return `${y}`;
    const dt = new Date(Date.UTC(y, mo - 1, d ?? 1));
    const monthName = dt.toLocaleString('en-US', { month: 'long' });
    if (!d) return `${monthName} ${y}`;
    // pad day with no leading zero in human format
    return `${d} ${monthName} ${y}`;
}

export default function Index() {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const [items, setItems] = useState<Exhibition[]>([]);
    const [loading, setLoading] = useState(false);

    // page-level error only for fetch failures
    const [pageError, setPageError] = useState<string | null>(null);

    // UI state
    const [q, setQ] = useState('');

    // Sort (default: updatedAt desc)
    const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    // Pagination
    const [page, setPage] = useState(1);

    // Create/Edit Modal
    const [showEdit, setShowEdit] = useState(false);
    const [editingItem, setEditingItem] = useState<Exhibition | null>(null);
    const [formValues, setFormValues] = useState<ExhibitionFormValues>({
        title: '',
        description: '',
        date: '',
        imageTitle: '',
        size: '',
        location: '',
    });

    // Image manager state (inside modal)
    const [existingImages, setExistingImages] = useState<string[]>([]); // base64 strings (from item)
    const [newFiles, setNewFiles] = useState<File[]>([]); // newly added files
    const [newPreviews, setNewPreviews] = useState<string[]>([]); // data URLs for newFiles

    // Modal-scoped UX state
    const [modalError, setModalError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Delete confirm
    const [showDelete, setShowDelete] = useState(false);
    const [deletingItem, setDeletingItem] = useState<Exhibition | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // LightBox (per item)
    const [lbOpen, setLbOpen] = useState(false);
    const [lbIndex, setLbIndex] = useState(0);
    const [lbImages, setLbImages] = useState<ImageType[]>([]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setPageError(null);
            const { data } = await axios.get(`${baseUrl}/api/exhibitions`);
            const list: Exhibition[] = Array.isArray(data) ? data : data.items ?? [];
            setItems(list);
        } catch (err: any) {
            setPageError(err?.response?.data?.message || 'Failed to load exhibitions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter + sort
    const processed = useMemo(() => {
        let list = [...items];

        if (q.trim()) {
            const n = q.trim().toLowerCase();
            list = list.filter((it) =>
                [it.title, it.description, it.location, it.size, it.imageTitle, it.date]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(n))
            );
        }

        list.sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;

            const getVal = (x: Exhibition) => {
                switch (sortKey) {
                    case 'title':
                        return (x.title || '').toLowerCase();
                    case 'date':
                        return x.date || '';
                    case 'location':
                        return (x.location || '').toLowerCase();
                    default:
                        return x.updatedAt || '';
                }
            };

            const av = getVal(a);
            const bv = getVal(b);

            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return 0;
        });

        return list;
    }, [items, q, sortKey, sortDir]);

    // Pagination derived
    const pages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
    const paged = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return processed.slice(start, start + PAGE_SIZE);
    }, [processed, page]);

    useEffect(() => {
        if (page > pages) setPage(1);
    }, [pages, page]);

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

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    // --- Modal helpers ---
    const resetForm = () => {
        setFormValues({
            title: '',
            description: '',
            date: '',
            imageTitle: '',
            size: '',
            location: '',
        });
        setExistingImages([]);
        setNewFiles([]);
        setNewPreviews([]);
        setModalError(null);
    };

    const openCreate = () => {
        setEditingItem(null);
        resetForm();
        setShowEdit(true);
    };

    const openEdit = (it: Exhibition) => {
        setEditingItem(it);
        setFormValues({
            title: it.title || '',
            description: it.description || '',
            date: it.date || '',
            imageTitle: it.imageTitle || '',
            size: it.size || '',
            location: it.location || '',
        });
        setExistingImages([...(it.images || [])]); // start with item images
        setNewFiles([]);
        setNewPreviews([]);
        setModalError(null);
        setShowEdit(true);
    };

    const handleCloseEdit = () => {
        if (isSaving) return; // block while saving
        setShowEdit(false);
        setEditingItem(null);
        resetForm();
    };

    const onChangeField = (key: keyof ExhibitionFormValues, value: any) => {
        setFormValues((s) => ({ ...s, [key]: value }));
    };

    // add new files (append)
    const addFiles = (files: FileList | null) => {
        if (!files || !files.length) return;
        const append = Array.from(files);
        const next = [...newFiles, ...append];
        setNewFiles(next);

        // update previews for appended files
        Promise.all(
            append.map(
                (f) =>
                    new Promise<string>((resolve) => {
                        const r = new FileReader();
                        r.onload = (e) => resolve(String(e.target?.result || ''));
                        r.readAsDataURL(f);
                    })
            )
        ).then((arr) => setNewPreviews((prev) => [...prev, ...arr]));
    };

    const removeExistingAt = (idx: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== idx));
    };

    const removeNewAt = (idx: number) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== idx));
        setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
    };

    const submitCreateOrUpdate = async () => {
        // validate flexible date if present
        if (formValues.date && !isValidPartialDate(formValues.date)) {
            setModalError('Date must be YYYY, YYYY-MM, or YYYY-MM-DD.');
            return;
        }

        try {
            setIsSaving(true);
            setModalError(null);

            const fd = new FormData();
            fd.append('title', formValues.title);
            fd.append('description', formValues.description);
            if (formValues.date) fd.append('date', formValues.date.trim());
            if (formValues.imageTitle) fd.append('imageTitle', formValues.imageTitle);
            if (formValues.size) fd.append('size', formValues.size);
            if (formValues.location) fd.append('location', formValues.location);

            // images protocol:
            // - keepImages: JSON array of base64 strings for existing images you kept
            // - images: new files (zero or more)
            fd.append('keepImages', JSON.stringify(existingImages));
            newFiles.forEach((f) => fd.append('images', f));

            if (editingItem) {
                const { data } = await api.put(`${baseUrl}/api/exhibitions/${editingItem._id}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setItems((prev) => prev.map((x) => (x._id === data._id ? data : x)));
            } else {
                if (existingImages.length === 0 && newFiles.length === 0) {
                    setModalError('Please add at least one image.');
                    setIsSaving(false);
                    return;
                }
                const { data } = await api.post(`${baseUrl}/api/exhibitions`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setItems((prev) => [data, ...prev]);
            }

            setShowEdit(false);
            resetForm();
        } catch (err: any) {
            setModalError(err?.response?.data?.message || 'Save failed');
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = (it: Exhibition) => {
        setDeletingItem(it);
        setShowDelete(true);
    };

    const doDelete = async () => {
        if (!deletingItem) return;
        try {
            setIsDeleting(true);
            await api.delete(`${baseUrl}/api/exhibitions/${deletingItem._id}`);
            setItems((prev) => prev.filter((x) => x._id !== deletingItem._id));
            setShowDelete(false);
            setDeletingItem(null);
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Delete failed');
        } finally {
            setIsDeleting(false);
        }
    };

    // LightBox per item
    const openLightboxForItem = (it: Exhibition, startIndex = 0) => {
        const imgs: ImageType[] = (it.images || []).map((b64, i) => ({
            src: `data:image/png;base64,${b64}`,
            caption: it.title || `Image ${i + 1}`,
        }));
        setLbImages(imgs);
        setLbIndex(Math.max(0, Math.min(startIndex, imgs.length - 1)));
        setLbOpen(true);
    };
    const closeLightbox = () => setLbOpen(false);
    const moveNext = () => setLbIndex((p) => (p + 1) % lbImages.length);
    const movePrev = () => setLbIndex((p) => (p + lbImages.length - 1) % lbImages.length);

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
                                    placeholder="Search title, description, location…"
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

                {/* Loading */}
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
                                            <th style={{ width: 86 }}>Preview</th>
                                            <th
                                                role="button"
                                                onClick={() => toggleSort('title')}
                                                className="user-select-none col-title">
                                                <span className="me-1">Title</span>
                                                {sortKey === 'title' && (
                                                    <FeatherIcon
                                                        icon={sortDir === 'asc' ? 'chevron-up' : 'chevron-down'}
                                                    />
                                                )}
                                            </th>
                                            <th
                                                className="col-location"
                                                role="button"
                                                onClick={() => toggleSort('location')}>
                                                <span className="me-1">Location</span>
                                                {sortKey === 'location' && (
                                                    <FeatherIcon
                                                        icon={sortDir === 'asc' ? 'chevron-up' : 'chevron-down'}
                                                    />
                                                )}
                                            </th>
                                            <th className="col-image">Image</th>
                                            <th
                                                role="button"
                                                onClick={() => toggleSort('updatedAt')}
                                                className="user-select-none col-desc">
                                                <span className="me-1">Description</span>
                                                {sortKey === 'updatedAt' && (
                                                    <FeatherIcon
                                                        icon={sortDir === 'asc' ? 'chevron-up' : 'chevron-down'}
                                                    />
                                                )}
                                            </th>
                                            <th style={{ width: 90 }} className="text-end">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {processed.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-4 text-muted">
                                                    No items
                                                </td>
                                            </tr>
                                        ) : (
                                            paged.map((it) => {
                                                const previewSrc = it.images?.length
                                                    ? `data:image/png;base64,${it.images[0]}`
                                                    : undefined;
                                                return (
                                                    <tr key={it._id}>
                                                        {/* Preview */}
                                                        <td>
                                                            <div
                                                                className="ratio ratio-1x1"
                                                                style={{
                                                                    width: 70,
                                                                    cursor: previewSrc ? 'pointer' : 'default',
                                                                }}
                                                                onClick={() => previewSrc && openLightboxForItem(it, 0)}
                                                                title={previewSrc ? 'View' : ''}>
                                                                {previewSrc ? (
                                                                    <Image
                                                                        rounded
                                                                        fluid
                                                                        src={previewSrc}
                                                                        alt={it.title}
                                                                        style={{ objectFit: 'cover' }}
                                                                    />
                                                                ) : (
                                                                    <div className="bg-light rounded w-100 h-100 d-flex align-items-center justify-content-center text-muted small">
                                                                        No Image
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Title (with date under it) */}
                                                        <td className="col-title">
                                                            <div className="fw-semibold truncate-lg">{it.title}</div>
                                                            {!!it.date && (
                                                                <div className="text-muted small meta-subline">
                                                                    {formatDateHuman(it.date)}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Location */}
                                                        <td className="col-location">
                                                            <div className="truncate-lg">{it.location || '-'}</div>
                                                        </td>

                                                        {/* Image column: Image Title + Size */}
                                                        <td className="col-image">
                                                            <div className="fw-semibold truncate-lg">
                                                                {it.imageTitle || '-'}
                                                            </div>
                                                            <div className="text-muted small meta-subline">
                                                                {it.size || '-'}
                                                            </div>
                                                        </td>

                                                        {/* Description (compact truncated on mobile/tablet) */}
                                                        <td className="text-muted col-desc">
                                                            <div className="truncate-lg">
                                                                {limitForCompact(it.description || '')}
                                                            </div>
                                                        </td>

                                                        {/* Actions (Edit / Delete only) */}
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

            {/* Create/Edit Modal */}
            <Modal
                show={showEdit}
                onHide={handleCloseEdit}
                centered
                backdrop={isSaving ? 'static' : true}
                keyboard={!isSaving}>
                <Modal.Header closeButton={!isSaving}>
                    <Modal.Title>{editingItem ? 'Edit Exhibition' : 'Add New Exhibition'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Modal-scoped error */}
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
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                value={formValues.title}
                                onChange={(e) => onChangeField('title', e.target.value)}
                                placeholder="Exhibition title"
                                required
                                disabled={isSaving}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formValues.description}
                                onChange={(e) => onChangeField('description', e.target.value)}
                                placeholder="Short description"
                                required
                                disabled={isSaving}
                            />
                        </Form.Group>

                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Date (flexible)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="YYYY or YYYY-MM or YYYY-MM-DD"
                                        value={formValues.date}
                                        onChange={(e) => onChangeField('date', e.target.value)}
                                        disabled={isSaving}
                                    />
                                    <Form.Text className="text-muted">
                                        Examples: <code>2024</code>, <code>2024-03</code>, <code>2024-03-18</code>
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        value={formValues.location}
                                        onChange={(e) => onChangeField('location', e.target.value)}
                                        placeholder="e.g. Colombo Scope"
                                        disabled={isSaving}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="g-3 mt-1">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Size</Form.Label>
                                    <Form.Control
                                        value={formValues.size}
                                        onChange={(e) => onChangeField('size', e.target.value)}
                                        placeholder="e.g. Variable"
                                        disabled={isSaving}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Image Title</Form.Label>
                                    <Form.Control
                                        value={formValues.imageTitle}
                                        onChange={(e) => onChangeField('imageTitle', e.target.value)}
                                        placeholder="e.g. Nail on Tracing sheet"
                                        disabled={isSaving}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Images manager */}
                        <Form.Group className="mt-3">
                            <Form.Label>Images</Form.Label>

                            <div className="d-flex flex-wrap gap-2">
                                {/* Existing images */}
                                {existingImages.map((b64, idx) => (
                                    <div key={`ex-${idx}`} className="img-chip">
                                        <img
                                            src={`data:image/png;base64,${b64}`}
                                            alt={`existing-${idx}`}
                                            className="img-chip-img"
                                        />
                                        <button
                                            type="button"
                                            className="img-chip-close"
                                            aria-label="Remove image"
                                            onClick={() => removeExistingAt(idx)}
                                            disabled={isSaving}>
                                            &times;
                                        </button>
                                    </div>
                                ))}

                                {/* New images (previews) */}
                                {newPreviews.map((u, idx) => (
                                    <div key={`new-${idx}`} className="img-chip">
                                        <img src={u} alt={`preview-${idx}`} className="img-chip-img" />
                                        <button
                                            type="button"
                                            className="img-chip-close"
                                            aria-label="Remove image"
                                            onClick={() => removeNewAt(idx)}
                                            disabled={isSaving}>
                                            &times;
                                        </button>
                                    </div>
                                ))}

                                {/* Plus tile (append files) */}
                                <label className="img-plus-tile">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            addFiles(e.target.files);
                                            e.currentTarget.value = ''; // allow same file re-select
                                        }}
                                        disabled={isSaving}
                                        style={{ display: 'none' }}
                                    />
                                    <div className="img-plus-inner">
                                        <FeatherIcon icon="plus" size={20} />
                                    </div>
                                </label>
                            </div>

                            {/* Helper text */}
                            <div className="form-text mt-1">
                                Remove with “×”. Use the plus tile to add more. When you click
                                {editingItem ? ' Update' : ' Create'}, the current set of tiles will be saved.
                            </div>
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 mt-3">
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
                    <Modal.Title>Delete Exhibition</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete <strong>{deletingItem?.title || 'this exhibition'}</strong>? This
                    action cannot be undone.
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

            {/* LightBox (per exhibition) */}
            {lbOpen && (
                <LightBox
                    images={lbImages}
                    photoIndex={lbIndex}
                    closeLightbox={closeLightbox}
                    moveNext={moveNext}
                    movePrev={movePrev}
                />
            )}

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

  /* Column sizing + truncation */
  .col-title, .col-desc, .col-location, .col-image { white-space: normal; }

  @media (max-width: 991.98px) {
    .col-title { min-width: 260px; }
    .col-desc  { min-width: 300px; }
    .col-location { min-width: 160px; }
    .col-image { min-width: 220px; }
    .admin-actions .btn { padding: 0 .25rem; }
  }

  @media (min-width: 992px) {
    .col-title { max-width: 280px; }
    .col-desc  { max-width: 360px; }
    .col-location { max-width: 220px; }
    .col-image { max-width: 260px; }
    .truncate-lg {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: bottom;
    }
    .col-title .meta-subline,
    .col-image .meta-subline {
      overflow: visible;
      text-overflow: clip;
      white-space: normal;
    }
  }

  .meta-subline {
    display: block;
    margin-top: .15rem;
    white-space: normal;
  }

  /* Image manager chips */
  .img-chip {
    position: relative;
    width: 88px;
    height: 88px;
    border-radius: 8px;
    overflow: hidden;
    background: #f8f9fa;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,.05);
  }
  .img-chip-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .img-chip-close {
    position: absolute;
    top: 2px;
    right: 4px;
    width: 22px;
    height: 22px;
    border: 0;
    border-radius: 999px;
    background: rgba(0,0,0,.55);
    color: #fff;
    line-height: 20px;
    font-size: 16px;
    cursor: pointer;
  }
  .img-chip-close:disabled {
    opacity: .6;
    cursor: not-allowed;
  }

  .img-plus-tile {
    width: 88px;
    height: 88px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #f1f3f5;
    border: 1px dashed rgba(0,0,0,.2);
    cursor: pointer;
    transition: background .15s ease, border-color .15s ease;
  }
  .img-plus-tile:hover {
    background: #eceff1;
    border-color: rgba(0,0,0,.35);
  }
  .img-plus-inner {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`}</style>
        </>
    );
}
