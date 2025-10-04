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

type GalleryItem = {
    _id: string;
    title: string;
    image: string; // base64 (no data: prefix)
    createdAt?: string;
    updatedAt?: string;
};

type GalleryFormValues = {
    title: string;
    imageFile?: File | null;
};

type SortKey = 'title' | 'updatedAt';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

export default function Index() {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(false); // fetch-only loading
    const [pageError, setPageError] = useState<string | null>(null); // fetch-only errors

    // UI state
    const [q, setQ] = useState('');

    // Sort (default: updatedAt desc)
    const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    // Pagination
    const [page, setPage] = useState(1);

    // Create/Edit Modal
    const [showEdit, setShowEdit] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [formValues, setFormValues] = useState<GalleryFormValues>({
        title: '',
        imageFile: null,
    });
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [modalError, setModalError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const dirtyRef = useRef(false);

    // Delete confirm
    const [showDelete, setShowDelete] = useState(false);
    const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Discard confirm (kept from your original, but unused now — left intact)
    const [showDiscard, setShowDiscard] = useState(false);
    const pendingCloseRef = useRef<() => void>(() => {});

    // LightBox
    const [isOpen, setIsOpen] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [lightboxImages, setLightboxImages] = useState<ImageType[]>([]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            setPageError(null);
            const { data } = await axios.get(`${baseUrl}/api/galleries`);
            const list: GalleryItem[] = Array.isArray(data) ? data : data.items ?? [];
            setItems(list);
        } catch (err: any) {
            setPageError(err?.response?.data?.message || 'Failed to load gallery items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Prepare images for LightBox once items load
    useEffect(() => {
        const imgs: ImageType[] = items.map((it) => ({
            src: `data:image/png;base64,${it.image}`,
            caption: it.title || '',
        }));
        setLightboxImages(imgs);
    }, [items]);

    // Filter + sort (client-side)
    const processed = useMemo(() => {
        let list = [...items];

        if (q.trim()) {
            const n = q.trim().toLowerCase();
            list = list.filter((it) => it.title?.toLowerCase().includes(n));
        }

        list.sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            const av = sortKey === 'title' ? (a.title || '').toLowerCase() : a.updatedAt || '';
            const bv = sortKey === 'title' ? (b.title || '').toLowerCase() : b.updatedAt || '';

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

    // Sort header click
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
        setFormValues({ title: '', imageFile: null });
        setPreviewUrl('');
        setModalError(null);
        dirtyRef.current = false;
    };

    const openCreate = () => {
        setEditingItem(null);
        resetForm();
        setShowEdit(true);
    };

    const openEdit = (it: GalleryItem, rowIndex: number) => {
        setEditingItem(it);
        setFormValues({ title: it.title || '', imageFile: null });
        setPreviewUrl(`data:image/png;base64,${it.image}`);
        setModalError(null);
        dirtyRef.current = false;
        setShowEdit(true);

        // Keep LB images aligned (optional)
        setPhotoIndex((page - 1) * PAGE_SIZE + rowIndex);
    };

    const handleCloseEdit = () => {
        if (isSaving) return; // block while saving
        const doClose = () => {
            setShowEdit(false);
            setEditingItem(null);
            resetForm();
        };
        doClose();
    };

    const onChangeField = (key: keyof GalleryFormValues, value: any) => {
        dirtyRef.current = true;
        setFormValues((s) => ({ ...s, [key]: value }));
    };

    const onChangeFile = (file: File | null) => {
        onChangeField('imageFile', file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(String(e.target?.result || ''));
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl('');
        }
    };

    const submitCreateOrUpdate = async () => {
        try {
            setIsSaving(true);
            setModalError(null);

            const fd = new FormData();
            fd.append('title', formValues.title);
            if (formValues.imageFile) fd.append('image', formValues.imageFile);

            if (editingItem) {
                const { data } = await api.put(`/api/galleries/${editingItem._id}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setItems((prev) => prev.map((x) => (x._id === data._id ? data : x)));
            } else {
                if (!formValues.imageFile) {
                    setModalError('Please choose an image');
                    setIsSaving(false);
                    return;
                }
                const { data } = await api.post('/api/galleries', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
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

    const confirmDelete = (it: GalleryItem) => {
        setDeletingItem(it);
        setShowDelete(true);
    };

    const doDelete = async () => {
        if (!deletingItem) return;
        try {
            setIsDeleting(true);
            await api.delete(`/api/galleries/${deletingItem._id}`);
            setItems((prev) => prev.filter((x) => x._id !== deletingItem._id));
            setShowDelete(false);
            setDeletingItem(null);
        } catch (err: any) {
            // simple inline surfacing for delete (keep modal open)
            alert(err?.response?.data?.message || 'Delete failed');
        } finally {
            setIsDeleting(false);
        }
    };

    // LightBox handlers
    const openLightbox = (globalIdx: number) => {
        setPhotoIndex(globalIdx);
        setIsOpen(true);
    };
    const closeLightbox = () => setIsOpen(false);
    const moveNext = () => setPhotoIndex((p) => (p + 1) % lightboxImages.length);
    const movePrev = () => setPhotoIndex((p) => (p + lightboxImages.length - 1) % lightboxImages.length);

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
                                    placeholder="Search title…"
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
                            {/* table-responsive gives horizontal scroll on small screens */}
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
                                            paged.map((it, idx) => {
                                                const globalIdx = (page - 1) * PAGE_SIZE + idx;
                                                return (
                                                    <tr key={it._id}>
                                                        <td>
                                                            <div
                                                                className="ratio ratio-1x1"
                                                                style={{ width: 70, cursor: 'pointer' }}
                                                                onClick={() => openLightbox(globalIdx)}
                                                                title="View">
                                                                <Image
                                                                    rounded
                                                                    fluid
                                                                    src={`data:image/png;base64,${it.image}`}
                                                                    alt={it.title}
                                                                    style={{ objectFit: 'cover' }}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="col-title">
                                                            {/* Truncate on desktop only; full width + scroll on mobile */}
                                                            <div className="fw-semibold truncate-lg">{it.title}</div>
                                                        </td>
                                                        <td className="text-end text-nowrap admin-actions">
                                                            <div className="d-inline-flex align-items-center gap-2">
                                                                <OverlayTrigger
                                                                    overlay={<Tooltip>Edit</Tooltip>}
                                                                    placement="top">
                                                                    <Button
                                                                        variant="link"
                                                                        className="text-primary p-0"
                                                                        onClick={() => openEdit(it, idx)}>
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

            {/* Create/Edit Modal (errors & saving state handled here) */}
            <Modal
                show={showEdit}
                onHide={handleCloseEdit}
                centered
                backdrop={isSaving ? 'static' : true}
                keyboard={!isSaving}>
                <Modal.Header closeButton={!isSaving}>
                    <Modal.Title>{editingItem ? 'Edit Item' : 'Add New Item'}</Modal.Title>
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
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                value={formValues.title}
                                onChange={(e) => onChangeField('title', e.target.value)}
                                placeholder="Artwork title"
                                required
                                disabled={isSaving}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>
                                Image{' '}
                                {editingItem ? <span className="text-muted">(leave empty to keep current)</span> : '*'}
                            </Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={(e) => onChangeFile((e.target as HTMLInputElement).files?.[0] ?? null)}
                                disabled={isSaving}
                            />
                            {(previewUrl || editingItem) && (
                                <div className="mt-3">
                                    <div className="ratio ratio-16x9">
                                        <img
                                            src={previewUrl || `data:image/png;base64,${editingItem?.image || ''}`}
                                            alt="preview"
                                            style={{ objectFit: 'cover', width: '100%', borderRadius: 8 }}
                                        />
                                    </div>
                                </div>
                            )}
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
                    <Modal.Title>Delete Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete <strong>{deletingItem?.title || 'this item'}</strong>? This action
                    cannot be undone.
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

            {/* Discard changes confirm (kept as-is from your file, not currently triggered) */}
            <Modal show={showDiscard} onHide={() => setShowDiscard(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Discard Changes?</Modal.Title>
                </Modal.Header>
                <Modal.Body>There are unsaved changes. Are you sure you want to close?</Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowDiscard(false)}>
                        Continue Editing
                    </Button>
                    <Button
                        variant="warning"
                        onClick={() => {
                            setShowDiscard(false);
                            pendingCloseRef.current?.();
                        }}>
                        Discard
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* LightBox */}
            {isOpen && (
                <LightBox
                    images={lightboxImages}
                    photoIndex={photoIndex}
                    closeLightbox={closeLightbox}
                    moveNext={moveNext}
                    movePrev={movePrev}
                />
            )}

            {/* Minor table polish & responsive column sizing */}
            <style>{`
  /* Never overlap with sticky AdminNavbar */
  .admin-toolbar-offset { padding-top: 4rem; }

  /* Desktop (≥992px): cap BOTH search and button widths */
  @media (min-width: 992px) {
    .search-max { max-width: 560px; }  /* cap search bar on desktop */
    .btn-max    { max-width: 220px; }  /* cap button on desktop */
  }

  /* Tablets & mobile (<992px): cap ONLY the button, search is fluid */
  @media (max-width: 991.98px) {
    .btn-max { max-width: 280px; }     /* button capped; w-100 respects this */
    .search-max { max-width: none; }   /* search stays full width */
    .admin-toolbar-offset { padding-top: 7.5rem; }
  }

  /* Phones (optional fine-tune) */
  @media (max-width: 575.98px) {
    .admin-toolbar-offset { padding-top: 8.25rem; }
  }

  /* Table polish */
  .table td, .table th { vertical-align: middle !important; }
  thead th[role="button"] { cursor: pointer; }

  /* Responsive column sizing + truncation */
  .col-title { white-space: normal; }

  @media (max-width: 991.98px) {
    .col-title { min-width: 300px; }
  }

  @media (min-width: 992px) {
    .col-title { max-width: 480px; }
    .truncate-lg {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: bottom;
    }
  }
`}</style>
        </>
    );
}
