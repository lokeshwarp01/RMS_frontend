import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import axios from "axios";

const API_URL = "http://localhost:5000/api/mail/history";

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = sessionStorage.getItem("token") || "";

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHistory(response.data.reverse()); // latest first
        setFiltered(response.data.reverse());
      } catch (err) {
        console.error("Failed to load history", err);
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  // Search filter logic
  useEffect(() => {
    const s = search.toLowerCase();
    const filteredList = history.filter(
      (item) =>
        item.recruiterEmail.toLowerCase().includes(s) ||
        item.subject.toLowerCase().includes(s)
    );
    setFiltered(filteredList);
  }, [search]);

  if (loading) {
    return (
      <Box textAlign="center" mt={10}>
        <CircularProgress />
        <Typography mt={2}>Loading history...</Typography>
      </Box>
    );
  }

  return (
    <Box padding={4}>
      <Typography variant="h4" fontWeight={600} mb={3}>
        Mail History
      </Typography>

      <TextField
        label="Search by recruiter email or subject"
        fullWidth
        sx={{ mb: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 && (
        <Typography textAlign="center" color="gray">
          No matching records
        </Typography>
      )}

      <Box display="flex" flexDirection="column" gap={2}>
        {filtered.map((item, index) => (
          <Card key={index} sx={{ borderLeft: "4px solid #2196F3" }}>
            <CardContent>
              <Typography variant="h6">{item.subject}</Typography>

              <Typography color="text.secondary">
                To: {item.recruiterEmail}
              </Typography>

              <Box mt={1}>
                <Chip
                  label={item.status === "success" ? "Success" : "Failed"}
                  color={item.status === "success" ? "success" : "error"}
                  sx={{ mr: 1 }}
                />

                <Chip
                  label={`Attachments: ${item.attachmentsCount}`}
                  variant="outlined"
                />
              </Box>

              <Typography variant="body2" color="gray" mt={1}>
                Sent At: {new Date(item.sentAt).toLocaleString()}
              </Typography>

              {item.errorMessage && (
                <Typography color="error" mt={1}>
                  Error: {item.errorMessage}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default HistoryPage;
