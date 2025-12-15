import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/user";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      // Save JWT token
      sessionStorage.setItem("token", response.data.token);

      alert("Login successful!");

      navigate("/"); // redirect to dashboard (change to your route)
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
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
          Login
        </Typography>

        {error && (
          <Typography color="error" mb={1}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
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
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Typography textAlign="center" mt={2}>
          Don’t have an account?{" "}
          <Link
            sx={{ cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
