import { useState } from "react";
import { Container, Card, Form, Button, Row, Col, Tabs, Tab } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import ErrorAlert from "../components/ErrorAlert";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [error, setError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError("");
    try {
      const res = await authService.updateProfile(profileForm);
      setUser(res.data.user);
      toast.success("Profile updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setError("");
    try {
      await authService.updatePassword(passwordForm);
      toast.success("Password updated.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: 640 }}>
      <h3 className="mb-4">My Profile</h3>
      <ErrorAlert message={error} />
      <Card className="shadow-sm p-3">
        <Tabs defaultActiveKey="info" className="mb-3">
          <Tab eventKey="info" title="Profile Info">
            <Form onSubmit={handleProfileSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control value={user?.email} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </Form.Group>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </Form>
          </Tab>
          <Tab eventKey="password" title="Change Password">
            <Form onSubmit={handlePasswordSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </Form.Group>
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? "Updating..." : "Update Password"}
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Card>
    </Container>
  );
};

export default Profile;
