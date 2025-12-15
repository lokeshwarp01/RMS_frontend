import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "https://rms-backend-1-tsl0.onrender.com/api/user";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
      });

      alert("Registration successful!");
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="90vh"
    >
      <Paper sx={{ padding: 3, width: 350 }} elevation={3}>
        <Typography variant="h5" textAlign="center" marginBottom={3}>
          Register
        </Typography>

        {error && (
          <Typography color="error" mb={1}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleRegister}>
          <TextField
            label="Full Name"
            fullWidth
            sx={{ mb: 2 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextField
            label="Email"
            fullWidth
            type="email"
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Password"
            fullWidth
            type="password"
            sx={{ mb: 3 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            variant="contained"
            fullWidth
            type="submit"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <Typography textAlign="center" mt={2}>
          Already have an account?{" "}
          <Link sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
