import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Alert,
  Card,
  CardContent,
  Stack,
  LinearProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Send as SendIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import axios from "axios";

const MAIL_API = "http://localhost:5000/api/mail/send";

type AttachmentPlaceholder = {
  name: string;
  size: number;
  placeholder: true;
};

type AttachmentItem = File | AttachmentPlaceholder;

interface EmailResult {
  email: string;
  status: string;
  error?: string;
  timestamp: Date;
  batchId?: string; // To track which batch of emails
}

const STORAGE_KEYS = {
  SUBJECT: "lp_subject",
  BODY: "lp_body",
  EMAILS: "lp_emails",
  ATTACHMENTS: "lp_attachments_meta",
  RESULTS: "lp_results_history", // Store results history
};

const LandingPage: React.FC = () => {
  const [subject, setSubject] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [emails, setEmails] = useState<string>("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<EmailResult[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errors, setErrors] = useState<{ field: string; message: string }[]>(
    []
  );

  const token = sessionStorage.getItem("token");

  // Load saved values from sessionStorage
  useEffect(() => {
    try {
      const savedSubject = sessionStorage.getItem(STORAGE_KEYS.SUBJECT);
      const savedBody = sessionStorage.getItem(STORAGE_KEYS.BODY);
      const savedEmails = sessionStorage.getItem(STORAGE_KEYS.EMAILS);
      const savedAttachmentsJson = sessionStorage.getItem(
        STORAGE_KEYS.ATTACHMENTS
      );
      const savedResultsJson = sessionStorage.getItem(STORAGE_KEYS.RESULTS);

      if (savedSubject) setSubject(savedSubject);
      if (savedBody) setBody(savedBody);
      if (savedEmails) setEmails(savedEmails);

      if (savedAttachmentsJson) {
        const meta: AttachmentPlaceholder[] = JSON.parse(savedAttachmentsJson);
        setAttachments(meta);
      }

      if (savedResultsJson) {
        const savedResults: EmailResult[] = JSON.parse(savedResultsJson);
        // Convert string dates back to Date objects
        const resultsWithDates = savedResults.map((result) => ({
          ...result,
          timestamp: new Date(result.timestamp),
        }));
        setResults(resultsWithDates);
      }
    } catch (err) {
      console.warn("Failed to load saved landing page data:", err);
    }
  }, []);

  // Persistence functions
  const persistSubject = (value: string) => {
    setSubject(value);
    try {
      sessionStorage.setItem(STORAGE_KEYS.SUBJECT, value);
    } catch (err) {}
  };

  const persistBody = (value: string) => {
    setBody(value);
    try {
      sessionStorage.setItem(STORAGE_KEYS.BODY, value);
    } catch (err) {}
  };

  const persistEmails = (value: string) => {
    setEmails(value);
    try {
      sessionStorage.setItem(STORAGE_KEYS.EMAILS, value);
    } catch (err) {}
  };

  const persistAttachmentsMeta = (items: AttachmentItem[]) => {
    const meta = items.map((it) =>
      it instanceof File
        ? { name: it.name, size: it.size, placeholder: true }
        : it
    );
    try {
      sessionStorage.setItem(STORAGE_KEYS.ATTACHMENTS, JSON.stringify(meta));
    } catch (err) {}
  };

  const persistResults = (resultsData: EmailResult[]) => {
    try {
      sessionStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(resultsData));
    } catch (err) {}
  };

  // File handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files).slice(0, 5);

    const validFiles = filesArray.filter(
      (file) => file.size <= 10 * 1024 * 1024
    );
    if (validFiles.length !== filesArray.length) {
      setErrors((prev) => [
        ...prev,
        { field: "attachments", message: "Some files exceed 10MB limit" },
      ]);
    }

    setAttachments((prev) => {
      const combined = [...prev, ...validFiles].slice(0, 5);
      persistAttachmentsMeta(combined);
      return combined;
    });

    e.currentTarget.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const next = prev.filter((_, i) => i !== index);
      persistAttachmentsMeta(next);
      return next;
    });
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: { field: string; message: string }[] = [];

    if (!subject.trim()) {
      newErrors.push({ field: "subject", message: "Subject is required" });
    }

    if (!body.trim()) {
      newErrors.push({ field: "body", message: "Email body is required" });
    }

    const emailList = emails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (emailList.length === 0) {
      newErrors.push({
        field: "emails",
        message: "At least one email is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    emailList.forEach((email) => {
      if (!emailRegex.test(email)) {
        newErrors.push({
          field: "emails",
          message: `Invalid email format: ${email}`,
        });
      }
    });

    const hasPlaceholders = attachments.some((a) => !(a instanceof File));
    if (hasPlaceholders && attachments.length > 0) {
      newErrors.push({
        field: "attachments",
        message:
          "Some attachments are placeholders. Please re-select the files before sending.",
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Sending emails
  const sendEmail = async (email: string) => {
    const formData = new FormData();
    formData.append("recruiterEmail", email);
    formData.append("subject", subject);
    formData.append("body", body);

    attachments.forEach((att) => {
      if (att instanceof File) formData.append("attachments", att);
    });

    try {
      await axios.post(MAIL_API, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return {
        email,
        status: "success",
        timestamp: new Date(),
      };
    } catch (err: any) {
      return {
        email,
        status: "failed",
        error: err.response?.data?.error || "Unknown error",
        timestamp: new Date(),
      };
    }
  };

  const handleSendAll = async () => {
    if (!validateForm()) return;

    const emailList = emails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    setErrors([]);
    setSending(true);
    setProgress(0);

    const resultsArr: EmailResult[] = [];
    const totalEmails = emailList.length;
    const batchTimestamp = new Date().toISOString();

    for (let i = 0; i < emailList.length; i++) {
      const email = emailList[i];
      const result = await sendEmail(email);
      const resultWithBatch = { ...result, batchId: batchTimestamp };
      resultsArr.push(resultWithBatch);

      // Update results immediately for each email
      setResults((prev) => [...prev, resultWithBatch]);
      setProgress(Math.round(((i + 1) / totalEmails) * 100));
    }

    // Clear email field after sending
    setEmails("");
    sessionStorage.removeItem(STORAGE_KEYS.EMAILS);

    // Persist updated results
    const updatedResults = [...results, ...resultsArr];
    persistResults(updatedResults);

    setSending(false);
    setProgress(0);
  };

  // Clear all / reset
  const handleClearAll = () => {
    setSubject("");
    setBody("");
    setEmails("");
    setAttachments([]);
    setResults([]);
    setErrors([]);
    setSearchQuery("");

    try {
      sessionStorage.removeItem(STORAGE_KEYS.SUBJECT);
      sessionStorage.removeItem(STORAGE_KEYS.BODY);
      sessionStorage.removeItem(STORAGE_KEYS.EMAILS);
      sessionStorage.removeItem(STORAGE_KEYS.ATTACHMENTS);
      sessionStorage.removeItem(STORAGE_KEYS.RESULTS);
    } catch (err) {}
  };

  // Filter results based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return results;

    const query = searchQuery.toLowerCase();
    return results.filter(
      (result) =>
        result.email.toLowerCase().includes(query) ||
        (result.error && result.error.toLowerCase().includes(query)) ||
        result.status.toLowerCase().includes(query)
    );
  }, [results, searchQuery]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Counters
  const successCount = results.filter((r) => r.status === "success").length;
  const failedCount = results.filter((r) => r.status === "failed").length;
  const filteredSuccessCount = filteredResults.filter(
    (r) => r.status === "success"
  ).length;
  const filteredFailedCount = filteredResults.filter(
    (r) => r.status === "failed"
  ).length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 6 },
        backgroundColor: "#f5f7fa",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          maxWidth: 1600,
          margin: "0 auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        }}
      >
        {errors.length > 0 && (
          <Alert
            severity="error"
            sx={{ mx: 4, mt: 4, mb: 2 }}
            onClose={() => setErrors([])}
          >
            {errors.map((error, index) => (
              <div key={index}>{error.message}</div>
            ))}
          </Alert>
        )}

        <Box sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              gap: 4,
            }}
          >
            {/* LEFT SIDE - Email Composition */}
            <Box
              sx={{
                flex: { lg: 7 },
                width: { xs: "100%", lg: "auto" },
              }}
            >
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  width: { xs: "100%", lg: "800px" },
                  border: "1px solid #e0e0e0",
                  backgroundColor: "#ffffff",
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    fontWeight="bold"
                    color="primary"
                    sx={{ mb: 4 }}
                  >
                    <SendIcon
                      sx={{ mr: 2, verticalAlign: "middle", fontSize: 28 }}
                    />
                    Compose Email
                  </Typography>

                  <Stack spacing={4}>
                    <TextField
                      label="Subject *"
                      fullWidth
                      variant="outlined"
                      value={subject}
                      onChange={(e) => persistSubject(e.target.value)}
                      error={errors.some((e) => e.field === "subject")}
                      helperText={
                        errors.find((e) => e.field === "subject")?.message
                      }
                      InputProps={{
                        sx: {
                          fontSize: "1.1rem",
                          py: 1,
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": {
                            borderWidth: 2,
                          },
                        },
                      }}
                    />

                    <Box>
                      <TextField
                        label="Email Body (HTML supported) *"
                        fullWidth
                        multiline
                        rows={14}
                        variant="outlined"
                        value={body}
                        onChange={(e) => persistBody(e.target.value)}
                        error={errors.some((e) => e.field === "body")}
                        helperText={
                          errors.find((e) => e.field === "body")?.message
                        }
                        InputProps={{
                          sx: {
                            fontFamily: "'Fira Code', 'Courier New', monospace",
                            fontSize: "0.95rem",
                          },
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&.Mui-focused fieldset": {
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography
                        variant="h6"
                        gutterBottom
                        fontWeight="bold"
                        sx={{ mb: 2 }}
                      >
                        <AttachFileIcon sx={{ mr: 2, fontSize: "1.2rem" }} />
                        Attachments (Max 5 files, 10MB each)
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<UploadIcon />}
                          size="large"
                          sx={{
                            px: 3,
                            py: 1.5,
                          }}
                        >
                          Select Files
                          <input
                            type="file"
                            hidden
                            multiple
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </Button>

                        <Typography variant="body2" color="textSecondary">
                          Supports PDF, DOC, JPG, PNG
                        </Typography>
                      </Box>

                      {attachments.length > 0 && (
                        <Stack spacing={1.5} mt={2}>
                          {attachments.map((file, index) => {
                            const name =
                              file instanceof File ? file.name : file.name;
                            const sizeMB = (
                              (file instanceof File ? file.size : file.size) /
                              1024 /
                              1024
                            ).toFixed(2);
                            const isPlaceholder = !(file instanceof File);

                            return (
                              <Chip
                                key={`${name}-${index}`}
                                label={`${name} (${sizeMB} MB)${
                                  isPlaceholder ? " — re-upload required" : ""
                                }`}
                                onDelete={() => removeAttachment(index)}
                                deleteIcon={<DeleteIcon />}
                                variant="outlined"
                                size="medium"
                                sx={{
                                  maxWidth: 400,
                                  py: 1.5,
                                  "& .MuiChip-label": {
                                    px: 2,
                                    fontSize: "0.95rem",
                                  },
                                }}
                              />
                            );
                          })}
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            {/* RIGHT SIDE - Email List & Results */}
            <Box
              sx={{
                flex: { lg: 5 },
                width: { xs: "100%", lg: "auto" },
              }}
            >
              <Stack spacing={4}>
                {/* Email List Card */}
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    width: { xs: "100%", lg: "500px" },
                    border: "1px solid #e0e0e0",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h5"
                      gutterBottom
                      fontWeight="bold"
                      color="primary"
                      sx={{ mb: 3 }}
                    >
                      <EmailIcon
                        sx={{ mr: 2, verticalAlign: "middle", fontSize: 28 }}
                      />
                      Recipient List
                    </Typography>

                    <TextField
                      label="Recipient Emails *"
                      fullWidth
                      multiline
                      rows={8}
                      variant="outlined"
                      value={emails}
                      onChange={(e) => persistEmails(e.target.value)}
                      error={errors.some((e) => e.field === "emails")}
                      helperText={
                        errors.find((e) => e.field === "emails")?.message ||
                        "Enter emails separated by commas"
                      }
                      placeholder="recruiter1@company.com, recruiter2@company.com, ..."
                      sx={{ mb: 3 }}
                      InputProps={{
                        sx: {
                          fontSize: "1rem",
                          py: 1,
                        },
                      }}
                    />

                    <Typography variant="h6" color="textSecondary">
                      {emails.split(",").filter((e) => e.trim()).length}{" "}
                      email(s) entered
                    </Typography>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    width: { xs: "100%", lg: "500px" },
                    border: "1px solid #e0e0e0",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" spacing={3}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSendAll}
                        disabled={sending}
                        startIcon={
                          sending ? (
                            <CircularProgress size={24} />
                          ) : (
                            <SendIcon sx={{ fontSize: 24 }} />
                          )
                        }
                        size="large"
                        sx={{
                          py: 2,
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                        }}
                      >
                        {sending ? `Sending... ${progress}%` : "Send"}
                      </Button>

                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleClearAll}
                        disabled={sending}
                        startIcon={<DeleteIcon sx={{ fontSize: 24 }} />}
                        size="large"
                        sx={{
                          py: 2,
                          px: 4,
                          fontSize: "1.1rem",
                          minWidth: 150,
                        }}
                      >
                        Clear All
                      </Button>
                    </Stack>

                    {sending && (
                      <Box sx={{ mt: 3 }}>
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 5,
                            },
                          }}
                        />
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mt: 1 }}
                        >
                          Progress: {progress}%
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Results Card */}
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    width: { xs: "100%", lg: "500px" },
                    border: "1px solid #e0e0e0",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary"
                      >
                        Sending Results
                      </Typography>
                      {results.length > 0 && (
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Chip
                            icon={<CheckCircleIcon />}
                            label={`${successCount} Total Sent`}
                            color="success"
                            size="medium"
                            variant="outlined"
                            sx={{
                              fontSize: "1rem",
                              py: 1,
                            }}
                          />
                          <Chip
                            icon={<ErrorIcon />}
                            label={`${failedCount} Total Failed`}
                            color="error"
                            size="medium"
                            variant="outlined"
                            sx={{
                              fontSize: "1rem",
                              py: 1,
                            }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Search Bar */}
                    {results.length > 0 && (
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search emails, status, or error messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: searchQuery && (
                            <InputAdornment position="end">
                              <IconButton onClick={clearSearch} size="small">
                                <ClearIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}

                    {filteredResults.length === 0 ? (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 6,
                          border: "2px dashed #e0e0e0",
                          borderRadius: 2,
                        }}
                      >
                        <EmailIcon
                          sx={{ fontSize: 60, color: "grey.400", mb: 3 }}
                        />
                        <Typography
                          variant="h6"
                          color="textSecondary"
                          sx={{ mb: 1 }}
                        >
                          {searchQuery
                            ? "No matching results"
                            : "No emails sent yet"}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          {searchQuery
                            ? "Try a different search term"
                            : "Fill in the form and click 'Send All Emails'"}
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {searchQuery && (
                          <Box
                            sx={{
                              mb: 2,
                              display: "flex",
                              gap: 2,
                              justifyContent: "flex-end",
                            }}
                          >
                            <Chip
                              label={`${filteredSuccessCount} sent in search`}
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={`${filteredFailedCount} failed in search`}
                              color="error"
                              size="small"
                              variant="outlined"
                            />
                            <Typography variant="body2" color="textSecondary">
                              Showing {filteredResults.length} of{" "}
                              {results.length} results
                            </Typography>
                          </Box>
                        )}
                        <Box
                          sx={{
                            maxHeight: 400,
                            overflow: "auto",
                            border: "1px solid #e0e0e0",
                            borderRadius: 2,
                            p: 1,
                          }}
                        >
                          <List>
                            {filteredResults.map((r, index) => (
                              <React.Fragment
                                key={`${
                                  r.email
                                }-${r.timestamp.getTime()}-${index}`}
                              >
                                <ListItem
                                  sx={{
                                    bgcolor:
                                      r.status === "success"
                                        ? "success.50"
                                        : "error.50",
                                    borderRadius: 1.5,
                                    mb: 1.5,
                                    py: 2,
                                    px: 2,
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 48 }}>
                                    {r.status === "success" ? (
                                      <CheckCircleIcon
                                        color="success"
                                        sx={{ fontSize: 28 }}
                                      />
                                    ) : (
                                      <ErrorIcon
                                        color="error"
                                        sx={{ fontSize: 28 }}
                                      />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Typography
                                        variant="h6"
                                        fontWeight="medium"
                                        sx={{ mb: 0.5 }}
                                      >
                                        {r.email}
                                      </Typography>
                                    }
                                    secondary={
                                      <>
                                        {r.error && (
                                          <Typography
                                            variant="body2"
                                            color="error"
                                            sx={{ mt: 0.5 }}
                                          >
                                            {r.error}
                                          </Typography>
                                        )}
                                        <Typography
                                          variant="caption"
                                          color="textSecondary"
                                          sx={{ display: "block", mt: 0.5 }}
                                        >
                                          {r.timestamp.toLocaleString()}
                                        </Typography>
                                      </>
                                    }
                                  />
                                  <Chip
                                    label={
                                      r.status === "success"
                                        ? "Success"
                                        : "Failed"
                                    }
                                    size="medium"
                                    color={
                                      r.status === "success"
                                        ? "success"
                                        : "error"
                                    }
                                    variant="filled"
                                    sx={{
                                      fontWeight: "bold",
                                      fontSize: "0.9rem",
                                      px: 2,
                                    }}
                                  />
                                </ListItem>
                                {index < filteredResults.length - 1 && (
                                  <Divider />
                                )}
                              </React.Fragment>
                            ))}
                          </List>
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            bgcolor: "primary.main",
            p: 3,
            textAlign: "center",
            color: "white",
          }}
        >
          <Typography variant="h6">
            Total emails sent: <strong>{successCount}</strong> • Total failed:{" "}
            <strong>{failedCount}</strong>
          </Typography>
          {results.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              Last email sent:{" "}
              {results[results.length - 1]?.timestamp.toLocaleString()}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default LandingPage;
