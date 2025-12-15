import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Divider,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://rms-backend-1-tsl0.onrender.com/api/user";

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("token") || "";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load profile");
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading profile...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="90vh"
    >
      <Paper sx={{ padding: 4, width: 430 }} elevation={3}>
        <Typography variant="h5" textAlign="center" mb={3} fontWeight={600}>
          Profile
        </Typography>

        <Typography>
          <strong>Name:</strong> {user?.name}
        </Typography>
        <Typography>
          <strong>Email:</strong> {user?.email}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" mb={1}>
          Email Sending Settings
        </Typography>

        <Typography>
          <strong>Provider:</strong> {user?.provider || "Not Set"}
        </Typography>

        <Typography>
          <strong>From Mail:</strong> {user?.from_mail || "Not Set"}
        </Typography>

        <Typography>
          <strong>App Password:</strong>{" "}
          {user?.app_password ? "************" : "Not Set"}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="gray">
          Created: {new Date(user?.createdAt).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="gray" mb={3}>
          Updated: {new Date(user?.updatedAt).toLocaleString()}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate("/settings")}
          sx={{ mt: 1 }}
        >
          Edit Settings
        </Button>

        {/* NEW BUTTON */}
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate("/history")}
          sx={{ mt: 2 }}
        >
          View Mail History
        </Button>
      </Paper>
    </Box>
  );
};

export default Profile;
