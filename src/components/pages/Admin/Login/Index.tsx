import { useState } from 'react';
import axios from 'axios';
import { Button, Card, Col, Container, Form, InputGroup, Row, Alert } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

import {
    getToken,
    setToken,
    clearToken,
    setStoredUsername,
    getStoredUsername,
    isLoggedIn,
    authHeader,
} from 'utils/auth';

type Mode = 'login' | 'change';

const baseUrl = process.env.REACT_APP_BASE_URL;

export default function Index() {
    const [mode, setMode] = useState<Mode>('login');

    // Login state
    const [username, setUsername] = useState(getStoredUsername());
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    // Password visibility (login)
    const [showLoginPwd, setShowLoginPwd] = useState(false);

    // Change state
    const [currentUsername, setCurrentUsername] = useState(getStoredUsername());
    const [currentPassword, setCurrentPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [changeLoading, setChangeLoading] = useState(false);
    const [changeError, setChangeError] = useState<string | null>(null);
    const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

    // Password visibility (change)
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);

    const doLogin = async () => {
        setLoginError(null);
        if (!username.trim() || !password) {
            setLoginError('Username and password are required.');
            return;
        }
        try {
            setLoginLoading(true);
            const { data } = await axios.post(`${baseUrl}/api/auth/login`, {
                username,
                password,
            });
            if (data?.token) {
                setToken(data.token);
                setStoredUsername(data?.user?.username || username.trim());
            }
            window.location.assign('/admin/gallery');
        } catch (err: any) {
            setLoginError(err?.response?.data?.message || 'Login failed');
        } finally {
            setLoginLoading(false);
        }
    };

    const doChange = async () => {
        setChangeError(null);
        setChangeSuccess(null);

        if (!currentUsername.trim()) {
            setChangeError('Current username is required.');
            return;
        }
        if (!currentPassword) {
            setChangeError('Current password is required.');
            return;
        }
        if (!newUsername && !newPassword) {
            setChangeError('Enter a new username and/or a new password.');
            return;
        }
        if (newPassword && newPassword.length < 8) {
            setChangeError('New password must be at least 8 characters.');
            return;
        }
        if (newPassword && newPassword !== confirmNewPassword) {
            setChangeError('New password and confirmation do not match.');
            return;
        }

        try {
            setChangeLoading(true);

            const payload: Record<string, string> = {
                currentUsername: currentUsername.trim(),
                currentPassword,
            };
            if (newUsername) payload.username = newUsername.trim();
            if (newPassword) payload.newPassword = newPassword;

            const { data } = await axios.put(`${baseUrl}/api/auth`, payload, {
                headers: { ...authHeader() },
            });

            if (data?.token) setToken(data.token);
            if (data?.user?.username) {
                setStoredUsername(data.user.username);
                setUsername(data.user.username);
                setCurrentUsername(data.user.username);
            }

            setChangeSuccess('Credentials updated successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setNewUsername('');
        } catch (err: any) {
            setChangeError(err?.response?.data?.message || 'Update failed');
        } finally {
            setChangeLoading(false);
        }
    };

    const logout = () => {
        clearToken();
        setChangeSuccess(null);
        setChangeError(null);
        setLoginError(null);
        window.location.replace('/admin');
    };

    const colProps = mode === 'change' ? { md: 9, lg: 8, xl: 7 } : { md: 7, lg: 6, xl: 5 };

    const loggedIn = isLoggedIn();

    return (
        <section className="py-5">
            <Container>
                <Row className="justify-content-center">
                    <Col {...colProps}>
                        <Card className="shadow-sm">
                            <Card.Body className="p-4 p-md-5">
                                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                    <h3 className="mb-0">{mode === 'login' ? 'Sign in' : 'Change credentials'}</h3>

                                    {mode === 'change' ? (
                                        <Button variant="link" className="p-0" onClick={() => setMode('login')}>
                                            Back to login
                                        </Button>
                                    ) : (
                                        <Button variant="link" className="p-0" onClick={() => setMode('change')}>
                                            Change
                                        </Button>
                                    )}
                                </div>

                                {mode === 'login' ? (
                                    <>
                                        {loginError && <Alert variant="danger">{loginError}</Alert>}
                                        <Form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                if (!loginLoading) doLogin();
                                            }}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Username</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text>
                                                        <FeatherIcon icon="user" size={16} />
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        placeholder="your-admin-name"
                                                        disabled={loginLoading}
                                                        autoFocus
                                                    />
                                                </InputGroup>
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label>Password</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text>
                                                        <FeatherIcon icon="lock" size={16} />
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type={showLoginPwd ? 'text' : 'password'}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        disabled={loginLoading}
                                                    />
                                                    <Button
                                                        variant="link"
                                                        className="px-2"
                                                        onClick={() => setShowLoginPwd((s) => !s)}
                                                        tabIndex={-1}
                                                        aria-label={showLoginPwd ? 'Hide password' : 'Show password'}>
                                                        <FeatherIcon icon={showLoginPwd ? 'eye-off' : 'eye'} />
                                                    </Button>
                                                </InputGroup>
                                            </Form.Group>

                                            <div className="d-grid">
                                                <Button type="submit" disabled={loginLoading}>
                                                    {loginLoading && (
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                    Sign in
                                                </Button>
                                            </div>
                                        </Form>
                                    </>
                                ) : (
                                    <>
                                        {changeError && <Alert variant="danger">{changeError}</Alert>}
                                        {changeSuccess && <Alert variant="success">{changeSuccess}</Alert>}

                                        <Form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                if (!changeLoading) doChange();
                                            }}>
                                            {/* Row 1 */}
                                            <Row className="g-3">
                                                <Col sm={12} md={6}>
                                                    <Form.Group className="mb-0 mb-sm-2">
                                                        <Form.Label>Current username *</Form.Label>
                                                        <InputGroup>
                                                            <InputGroup.Text>
                                                                <FeatherIcon icon="user" size={16} />
                                                            </InputGroup.Text>
                                                            <Form.Control
                                                                value={currentUsername}
                                                                onChange={(e) => setCurrentUsername(e.target.value)}
                                                                placeholder="current-admin-name"
                                                                disabled={changeLoading}
                                                                autoFocus
                                                            />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={12} md={6}>
                                                    <Form.Group className="mb-0 mb-sm-2">
                                                        <Form.Label>Current password *</Form.Label>
                                                        <InputGroup>
                                                            <InputGroup.Text>
                                                                <FeatherIcon icon="lock" size={16} />
                                                            </InputGroup.Text>
                                                            <Form.Control
                                                                type={showCurrentPwd ? 'text' : 'password'}
                                                                value={currentPassword}
                                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                                placeholder="Your current password"
                                                                disabled={changeLoading}
                                                            />
                                                            <Button
                                                                variant="link"
                                                                className="px-2"
                                                                onClick={() => setShowCurrentPwd((s) => !s)}
                                                                tabIndex={-1}
                                                                aria-label={
                                                                    showCurrentPwd ? 'Hide password' : 'Show password'
                                                                }>
                                                                <FeatherIcon
                                                                    icon={showCurrentPwd ? 'eye-off' : 'eye'}
                                                                />
                                                            </Button>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            {/* Row 2 */}
                                            <Row className="g-3 mt-0">
                                                <Col sm={12} md={6}>
                                                    <Form.Group className="mb-0 mb-sm-2">
                                                        <Form.Label>New username (optional)</Form.Label>
                                                        <InputGroup>
                                                            <InputGroup.Text>
                                                                <FeatherIcon icon="edit-2" size={16} />
                                                            </InputGroup.Text>
                                                            <Form.Control
                                                                value={newUsername}
                                                                onChange={(e) => setNewUsername(e.target.value)}
                                                                placeholder="new-admin-name"
                                                                disabled={changeLoading}
                                                            />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={12} md={6}>
                                                    <Form.Group className="mb-0 mb-sm-2">
                                                        <Form.Label>New password (optional)</Form.Label>
                                                        <InputGroup>
                                                            <InputGroup.Text>
                                                                <FeatherIcon icon="key" size={16} />
                                                            </InputGroup.Text>
                                                            <Form.Control
                                                                type={showNewPwd ? 'text' : 'password'}
                                                                value={newPassword}
                                                                onChange={(e) => setNewPassword(e.target.value)}
                                                                placeholder="At least 8 characters"
                                                                disabled={changeLoading}
                                                            />
                                                            <Button
                                                                variant="link"
                                                                className="px-2"
                                                                onClick={() => setShowNewPwd((s) => !s)}
                                                                tabIndex={-1}
                                                                aria-label={
                                                                    showNewPwd ? 'Hide password' : 'Show password'
                                                                }>
                                                                <FeatherIcon icon={showNewPwd ? 'eye-off' : 'eye'} />
                                                            </Button>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            {/* Row 3 */}
                                            <Row className="g-3 mt-0">
                                                <Col sm={12}>
                                                    <Form.Group className="mb-0 mb-sm-2">
                                                        <Form.Label>Confirm new password</Form.Label>
                                                        <InputGroup>
                                                            <InputGroup.Text>
                                                                <FeatherIcon icon="check" size={16} />
                                                            </InputGroup.Text>
                                                            <Form.Control
                                                                type={showConfirmPwd ? 'text' : 'password'}
                                                                value={confirmNewPassword}
                                                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                                placeholder="Re-enter the new password"
                                                                disabled={changeLoading}
                                                            />
                                                            <Button
                                                                variant="link"
                                                                className="px-2"
                                                                onClick={() => setShowConfirmPwd((s) => !s)}
                                                                tabIndex={-1}
                                                                aria-label={
                                                                    showConfirmPwd ? 'Hide password' : 'Show password'
                                                                }>
                                                                <FeatherIcon
                                                                    icon={showConfirmPwd ? 'eye-off' : 'eye'}
                                                                />
                                                            </Button>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            {/* Right-aligned actions */}
                                            <div className="d-flex justify-content-end align-items-center mt-4 flex-wrap gap-2">
                                                {loggedIn && (
                                                    <Button
                                                        variant="outline-secondary"
                                                        type="button"
                                                        onClick={logout}
                                                        disabled={changeLoading}
                                                        title="Clears stored token">
                                                        Log out
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="light"
                                                    type="button"
                                                    onClick={() => setMode('login')}
                                                    disabled={changeLoading}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={changeLoading}>
                                                    {changeLoading && (
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                    Save changes
                                                </Button>
                                            </div>
                                        </Form>
                                    </>
                                )}
                            </Card.Body>
                        </Card>

                        <style>{`
              @media (max-width: 575.98px) {
                .mb-sm-2 { margin-bottom: .5rem !important; }
              }
            `}</style>
                    </Col>
                </Row>
            </Container>
        </section>
    );
}
