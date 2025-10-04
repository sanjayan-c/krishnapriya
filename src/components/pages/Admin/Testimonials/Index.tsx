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
import api from 'utils/http';

type Testimonial = {
  _id: string;
  description: string;
  name: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
};

type TestimonialFormValues = {
  description: string;
  name: string;
  position: string;
};

type SortKey = 'name' | 'position' | 'updatedAt';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

export default function Index() {
  const baseUrl = process.env.REACT_APP_BASE_URL;

  // Data
  const [items, setItems] = useState<Testimonial[]>([]);

  // Fetch state
  const [loading, setLoading] = useState(false);
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
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formValues, setFormValues] = useState<TestimonialFormValues>({
    description: '',
    name: '',
    position: '',
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dirtyRef = useRef(false);

  // Delete confirm
  const [showDelete, setShowDelete] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Testimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Compact detection for truncation
  const [isCompact, setIsCompact] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 992 : true
  );
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

  // ---- Fetch ----
  const fetchItems = async () => {
    try {
      setLoading(true);
      setPageError(null);
      const { data } = await axios.get(`${baseUrl}/api/testimonials`);
      const list: Testimonial[] = Array.isArray(data) ? data : data.items ?? [];
      setItems(list);
    } catch (err: any) {
      setPageError(err?.response?.data?.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Filter + sort ----
  const processed = useMemo(() => {
    let list = [...items];

    if (q.trim()) {
      const n = q.trim().toLowerCase();
      list = list.filter((it) =>
        [it.name, it.position, it.description]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(n))
      );
    }

    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      const getVal = (x: Testimonial) => {
        switch (sortKey) {
          case 'name':
            return (x.name || '').toLowerCase();
          case 'position':
            return (x.position || '').toLowerCase();
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

  const toggleSort = (key: Exclude<SortKey, 'updatedAt'>) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // ---- Modal helpers ----
  const resetForm = () => {
    setFormValues({ description: '', name: '', position: '' });
    setModalError(null);
    dirtyRef.current = false;
  };

  const openCreate = () => {
    setEditingItem(null);
    resetForm();
    setShowEdit(true);
  };

  const openEdit = (it: Testimonial) => {
    setEditingItem(it);
    setFormValues({
      description: it.description || '',
      name: it.name || '',
      position: it.position || '',
    });
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

  const onChangeField = (key: keyof TestimonialFormValues, value: any) => {
    dirtyRef.current = true;
    setFormValues((s) => ({ ...s, [key]: value }));
  };

  const submitCreateOrUpdate = async () => {
    if (!formValues.description.trim() || !formValues.name.trim()) {
      setModalError('Name and description are required.');
      return;
    }

    try {
      setIsSaving(true);
      setModalError(null);

      const payload = {
        description: formValues.description.trim(),
        name: formValues.name.trim(),
        position: formValues.position.trim(),
      };

      if (editingItem) {
        const { data } = await api.put(`${baseUrl}/api/testimonials/${editingItem._id}`, payload);
        setItems((prev) => prev.map((x) => (x._id === data._id ? data : x)));
      } else {
        const { data } = await api.post(`${baseUrl}/api/testimonials`, payload);
        setItems((prev) => [data, ...prev]);
      }

      setShowEdit(false);
      resetForm();
      dirtyRef.current = false;
      // Keep default sort by updatedAt desc after save
      setSortKey('updatedAt');
      setSortDir('desc');
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  // ---- Delete ----
  const confirmDelete = (it: Testimonial) => {
    setDeletingItem(it);
    setShowDelete(true);
  };

  const doDelete = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      await api.delete(`${baseUrl}/api/testimonials/${deletingItem._id}`);
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
                  placeholder="Search name, position, description…"
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
            style={{ minHeight: '300px' }}
          >
            <Loading style={{ width: 100, height: 100 }} />
          </section>
        ) : (
          <Card className="shadow-sm">
            <Card.Body>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead>
                    <tr>
                      <th
                        role="button"
                        onClick={() => toggleSort('name')}
                        className="user-select-none col-name"
                      >
                        <span className="me-1">Name</span>
                        {sortKey === 'name' && (
                          <FeatherIcon icon={sortDir === 'asc' ? 'chevron-up' : 'chevron-down'} />
                        )}
                      </th>
                      <th
                        role="button"
                        onClick={() => toggleSort('position')}
                        className="user-select-none col-position"
                      >
                        <span className="me-1">Position</span>
                        {sortKey === 'position' && (
                          <FeatherIcon icon={sortDir === 'asc' ? 'chevron-up' : 'chevron-down'} />
                        )}
                      </th>
                      <th className="col-desc">Description</th>
                      <th style={{ width: 90 }} className="text-end">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {processed.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">
                          No items
                        </td>
                      </tr>
                    ) : (
                      paged.map((it) => (
                        <tr key={it._id}>
                          <td className="col-name">
                            <div className="fw-semibold truncate-lg">{it.name}</div>
                          </td>
                          <td className="col-position">
                            <div className="truncate-lg">{it.position || '-'}</div>
                          </td>
                          <td className="text-muted col-desc">
                            <div className="truncate-lg">
                              {limitForCompact(it.description || '')}
                            </div>
                          </td>
                          <td className="text-end text-nowrap admin-actions">
                            <div className="d-inline-flex align-items-center gap-2">
                              <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>} placement="top">
                                <Button
                                  variant="link"
                                  className="text-primary p-0"
                                  onClick={() => openEdit(it)}
                                >
                                  <FeatherIcon icon="edit-2" />
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>} placement="top">
                                <Button
                                  variant="link"
                                  className="text-danger p-0"
                                  onClick={() => confirmDelete(it)}
                                >
                                  <FeatherIcon icon="trash-2" />
                                </Button>
                              </OverlayTrigger>
                            </div>
                          </td>
                        </tr>
                      ))
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
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <FeatherIcon icon="chevron-left" className="me-1" /> Prev
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={page >= pages}
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    >
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
        keyboard={!isSaving}
      >
        <Modal.Header closeButton={!isSaving}>
          <Modal.Title>{editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}</Modal.Title>
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
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>Name *</Form.Label>
              <Form.Control
                value={formValues.name}
                onChange={(e) => onChangeField('name', e.target.value)}
                placeholder="e.g. Jane Doe"
                required
                disabled={isSaving}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Position</Form.Label>
              <Form.Control
                value={formValues.position}
                onChange={(e) => onChangeField('position', e.target.value)}
                placeholder="e.g. Curator, Colombo Scope"
                disabled={isSaving}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formValues.description}
                onChange={(e) => onChangeField('description', e.target.value)}
                placeholder="What they said…"
                required
                disabled={isSaving}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="light" onClick={handleCloseEdit} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
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
        keyboard={!isDeleting}
      >
        <Modal.Header closeButton={!isDeleting}>
          <Modal.Title>Delete Testimonial</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this testimonial?
          <div className="text-muted small mt-2">
            <strong>{deletingItem?.name}</strong>
            {deletingItem?.position ? `, ${deletingItem.position}` : ''}
          </div>
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

  /* Column sizing + truncation */
  .col-name, .col-position, .col-desc { white-space: normal; }

  @media (max-width: 991.98px) {
    .col-name { min-width: 220px; }
    .col-position { min-width: 200px; }
    .col-desc  { min-width: 300px; }
    .admin-actions .btn { padding: 0 .25rem; }
  }

  @media (min-width: 992px) {
    .col-name { max-width: 240px; }
    .col-position { max-width: 240px; }
    .col-desc  { max-width: 480px; }
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
