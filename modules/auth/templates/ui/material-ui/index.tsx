import AlertMui from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { VistaarUIComponents } from "../../contract/types";

/**
 * Material UI adapter — uses @mui/material already merged by the UI overlay.
 */
export const authUI: VistaarUIComponents = {
  Button: ({ variant = "primary", className = "", children, ...props }) => {
    const muiVariant =
      variant === "primary" ? "contained" : variant === "secondary" ? "outlined" : "text";
    return (
      <Button className={className} variant={muiVariant} {...props}>
        {children}
      </Button>
    );
  },

  Input: ({ className = "", ...props }) => (
    <TextField className={className} size="small" fullWidth {...props} />
  ),

  Label: ({ className = "", children, ...props }) => (
    <Typography
      component="label"
      variant="body2"
      className={className}
      sx={{ display: "block", mb: 0.5, fontWeight: 600 }}
      {...props}
    >
      {children}
    </Typography>
  ),

  Card: ({ className = "", children }) => (
    <Card className={className} variant="outlined">
      {children}
    </Card>
  ),

  CardHeader: ({ className = "", children }) => (
    <Box className={className} sx={{ px: 2, pt: 2 }}>
      {children}
    </Box>
  ),

  CardTitle: ({ className = "", children }) => (
    <Typography className={className} variant="h5" component="h2">
      {children}
    </Typography>
  ),

  CardDescription: ({ className = "", children }) => (
    <Typography className={className} variant="body2" color="text.secondary">
      {children}
    </Typography>
  ),

  CardContent: ({ className = "", children }) => (
    <CardContent className={className}>{children}</CardContent>
  ),

  Alert: ({ tone = "error", className = "", children }) => (
    <AlertMui className={className} severity={tone === "error" ? "error" : "info"}>
      {children}
    </AlertMui>
  ),

  Spinner: ({ label = "Loading…", className = "" }) => (
    <Box className={className} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <CircularProgress size={18} />
      <Typography variant="body2">{label}</Typography>
    </Box>
  ),
};

export default authUI;
