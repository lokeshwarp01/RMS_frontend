import {
  Box,
  Typography,
  Stack,
  Container,
  Paper,
  Button,
} from "@mui/material";
import MailIcon from "@mui/icons-material/Mail";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Welcome = () => {
  const navigate = useNavigate();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setHasToken(!!token);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 1,
            backgroundColor: "white",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 4,
            }}
          >
            <MailIcon sx={{ fontSize: 40 }} />
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "text.primary",
              background: "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
            }}
          >
            Welcome to MailSender
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              mb: 5,
              color: "text.secondary",
              lineHeight: 1.6,
            }}
          >
            Send bulk emails effortlessly. Simple, secure, and scalable.
          </Typography>

          <Box
            sx={{
              mt: 5,
              pt: 4,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" color="text.secondary" mb={3}>
              Get started with:
            </Typography>
            <Stack spacing={1} alignItems="center">
              {[
                "✓ Bulk email sending",
                "✓ Multiple attachments",
                "✓ Secure Authentication",
                "✓ Free tier available",
              ].map((feature, index) => (
                <Typography key={index} variant="body2" color="text.secondary">
                  {feature}
                </Typography>
              ))}
            </Stack>
          </Box>

          {/* CONDITIONAL BUTTON BASED ON TOKEN */}
          {hasToken && (
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 4 }}
              onClick={() => navigate("/landingpage")}
            >
              Go to Landing Page
            </Button>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Welcome;
