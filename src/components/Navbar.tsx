import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import MailIcon from "@mui/icons-material/Mail";
import LoginIcon from "@mui/icons-material/Login";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import Settings from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
import useResponsive from "../hooks/useResponsive";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState<string>("");

  // Check token on component mount and on storage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = sessionStorage.getItem("token");
      const userData = sessionStorage.getItem("userData");

      setIsLoggedIn(!!token);

      // Extract user initial for avatar
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.name) {
            setUserInitial(parsedUser.name.charAt(0).toUpperCase());
          } else if (parsedUser.email) {
            setUserInitial(parsedUser.email.charAt(0).toUpperCase());
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };

    // Check initial status
    checkAuthStatus();

    // Listen for storage changes
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    // Add event listener for storage changes
    window.addEventListener("storage", handleStorageChange);

    // Also check on focus in case of tab/window changes
    window.addEventListener("focus", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", checkAuthStatus);
    };
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userData");
    // Clear local storage if used
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    // Update state
    setIsLoggedIn(false);
    setUserInitial("");

    // Navigate to home
    navigate("/");
    handleMenuClose();

    console.log("Logged Out Successfully");
  };

  const handleLogin = () => {
    navigate("/login");
    handleMenuClose();
  };

  const handleRegister = () => {
    navigate("/register");
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate("/profile");
    handleMenuClose();
  };

  const handleSettings = () => {
    navigate("/settings");
    handleMenuClose();
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "primary.main",
        height: "64px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ minHeight: "64px !important" }}>
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <MailIcon sx={{ mr: 1, fontSize: "1.8rem" }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            MailSender
          </Typography>
        </Box>

        {/* Desktop View */}
        {!isMobile && (
          <Box display="flex" alignItems="center" gap={2}>
            {isLoggedIn ? (
              // Logged In Menu
              <>
                <Button
                  color="inherit"
                  startIcon={<Settings />}
                  onClick={handleSettings}
                  sx={{ fontWeight: 500 }}
                >
                  Settings
                </Button>

                <Button
                  color="inherit"
                  startIcon={
                    userInitial ? (
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: "0.8rem",
                          backgroundColor: "white",
                          color: "primary.main",
                        }}
                      >
                        {userInitial}
                      </Avatar>
                    ) : (
                      <AccountCircleIcon />
                    )
                  }
                  onClick={handleProfile}
                  sx={{ fontWeight: 500 }}
                >
                  Profile
                </Button>

                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              // Logged Out Menu
              <>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<LoginIcon />}
                  onClick={handleLogin}
                  sx={{
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Login
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<HowToRegIcon />}
                  onClick={handleRegister}
                  sx={{
                    backgroundColor: "white",
                    color: "primary.main",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.9)",
                    },
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Mobile View */}
        {isMobile && (
          <>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{
                p: 1,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                },
              }}
            >
              {isLoggedIn ? (
                // Logged In Mobile Menu
                <>
                  <MenuItem onClick={handleSettings}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Settings sx={{ mr: 2, color: "primary.main" }} />
                      <Typography>Settings</Typography>
                    </Box>
                  </MenuItem>

                  <MenuItem onClick={handleProfile}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <AccountCircleIcon
                        sx={{ mr: 2, color: "primary.main" }}
                      />
                      <Typography>Profile</Typography>
                    </Box>
                  </MenuItem>

                  <MenuItem onClick={handleLogout}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <LogoutIcon sx={{ mr: 2, color: "error.main" }} />
                      <Typography sx={{ color: "error.main" }}>
                        Logout
                      </Typography>
                    </Box>
                  </MenuItem>
                </>
              ) : (
                // Logged Out Mobile Menu
                <>
                  <MenuItem onClick={handleLogin}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <LoginIcon sx={{ mr: 2, color: "primary.main" }} />
                      <Typography>Login</Typography>
                    </Box>
                  </MenuItem>

                  <MenuItem onClick={handleRegister}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <HowToRegIcon sx={{ mr: 2, color: "success.main" }} />
                      <Typography
                        sx={{ color: "success.main", fontWeight: 600 }}
                      >
                        Register
                      </Typography>
                    </Box>
                  </MenuItem>
                </>
              )}
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
