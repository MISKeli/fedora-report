import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import React, { useState } from "react";
import Button from "@mui/material/Button";
import { Controller, useForm } from "react-hook-form";
import { InputAdornment, TextField, IconButton } from "@mui/material";
import { AccountCircle, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { yupResolver } from "@hookform/resolvers/yup";
import "../../styles/Login/LoginPage.scss";
import { loginSchema } from "../../schema/validation";
import { useAuthMutation } from "../../features/api/loginApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { encrypt } from "../../utils/encrypt";
import { loginSlice } from "../../features/slice/authSlice";
import { appConfig } from "../../routes/appConfig";
import { toast } from "sonner";
import { info } from "../../schema/info";

// Import your logo
import fedoraIcon from "../../assets/images/fedora-icon.svg";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: { username: "", password: "" },
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const [login, { isLoading }] = useAuthMutation();

  // Check user permissions and find first allowed route
  const checkUserPermissions = (userPermissions, appConfig) => {
   

    // Recursive function to check permissions in nested structure
    const findFirstAllowedRoute = (config, parentPath = "") => {
      for (const item of config) {
        const fullPath = parentPath
          ? `${parentPath}/${item.path}`
          : `/${item.path}`;

        // Handle root path
        const currentPath = fullPath === "//" ? "/" : fullPath;

        // Check if user has permission for this item
        if (
          item.permissions &&
          item.permissions.some((permission) =>
            userPermissions.includes(permission)
          )
        ) {
          return currentPath;
        }

        // If item has children, check those recursively
        if (item.children) {
          const childRoute = findFirstAllowedRoute(item.children, currentPath);
          if (childRoute) {
            return childRoute;
          }
        }
      }
      return null;
    };

    return findFirstAllowedRoute(appConfig);
  };

  const loginHandler = async (data) => {
    setLoading(true);
    try {
      const response = await login(data).unwrap();
    

      // Store apiKey consistently
      const encryptedApiKey = encrypt(response?.apiKey);
      sessionStorage.setItem("apiKey", encryptedApiKey);

      // Update dispatch to use apiKey
      dispatch(loginSlice({ apiKey: response?.apiKey, user: response?.user }));

      sessionStorage.setItem("user", JSON.stringify(response));
      sessionStorage.setItem("uToken", encrypt(data?.username));
      sessionStorage.setItem("pToken", encrypt(data?.password));

      // Check permissions and navigate to appropriate route
      const userPermissions =
        response?.permissions || response?.user?.permissions || [];

      if (userPermissions.length > 0) {
        const allowedRoute = checkUserPermissions(userPermissions, appConfig);
       

        if (allowedRoute) {
          navigate(allowedRoute);
        } else {
          navigate("/access-denied");
        }
      } else {
        // No specific permissions, navigate to default route
        navigate("/");
      }

      toast.success("Login Successfully");
    } catch (error) {
     
      toast.error(error?.data?.error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login">
      <Box className="login__container">
        <Card className="login__card" sx={{ boxShadow: 3, borderRadius:2 }}>
          <CardContent>
            <Box className="login__card__header">
              <img 
                src={fedoraIcon} 
                alt="Fedora Logo" 
                className="login__card__header__logo"
              />
              <Typography variant="h4" className="login__card__header__title">
                {info.fedora.title}
              </Typography>
              <Typography variant="body1" className="login__card__header__subtitle">
                {info.fedora.subtitle}
              </Typography>
            </Box>
            <form
              className="login__card__form"
              onSubmit={handleSubmit(loginHandler)}
            >
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle />
                        </InputAdornment>
                      ),
                    }}
                    label="Username"
                    placeholder="Enter your username"
                    required
                    size="small"
                    fullWidth
                    helperText={errors?.username?.message}
                    error={!!errors?.username?.message}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    label="Password"
                    placeholder="Enter your password"
                    type={showPassword ? "text" : "password"}
                    required
                    size="small"
                    fullWidth
                    helperText={errors?.password?.message}
                    error={!!errors?.password?.message}
                  />
                )}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                
                className="login__card__button"
                disabled={!isValid || loading}
              >
                {loading ? (
                  <Box className="login__loading">
                    <Box className="login__loading__spinner" />
                    Signing In...
                  </Box>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Box className="login__footer">
          <Typography variant="body2" color="textSecondary" align="center">
            {info.fedora.footer}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;