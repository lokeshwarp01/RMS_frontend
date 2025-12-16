import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const API_URL = "http://localhost:5000/api/user";

const Settings: React.FC = () => {
  const [fromMail, setFromMail] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [provider, setProvider] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user data on page load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

        setFromMail(response.data.from_mail || "");
        setAppPassword(response.data.app_password || "");
        setProvider(response.data.provider || "");
      } catch (err: any) {
        setError("Failed to load settings");
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await axios.put(
        `${API_URL}/settings`,
        {
          from_mail: fromMail,
          app_password: appPassword,
          provider: provider,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      setSuccess("Settings updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.error || "Update failed");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading settings...</Typography>
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
      <Paper sx={{ padding: 3, width: 400 }} elevation={3}>
        <Typography variant="h5" textAlign="center" marginBottom={3}>
          Email Settings
        </Typography>

        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        {success && (
          <Typography color="green" mb={2}>
            {success}
          </Typography>
        )}

        <form onSubmit={handleSave}>
          <TextField
            label="From Email (your sender email)"
            fullWidth
            sx={{ mb: 2 }}
            value={fromMail}
            onChange={(e) => setFromMail(e.target.value)}
            required
          />

          <TextField
            label="App Password"
            type="password"
            fullWidth
            sx={{ mb: 2 }}
            value={appPassword}
            onChange={(e) => setAppPassword(e.target.value)}
            required
          />

          <TextField
            label="Provider"
            select
            fullWidth
            sx={{ mb: 3 }}
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            required
          >
            <MenuItem value="gmail">Gmail</MenuItem>
            <MenuItem value="zoho">Zoho</MenuItem>
            <MenuItem value="outlook">Outlook / Office 365</MenuItem>
            <MenuItem value="yahoo">Yahoo</MenuItem>
          </TextField>

          <Button variant="contained" type="submit" fullWidth disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Settings;
