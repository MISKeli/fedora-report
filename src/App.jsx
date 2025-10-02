import "./App.scss";
import { Provider } from "react-redux";
import store from "./app/store";
import ProvidesTheme from "./theme/ProvidesTheme";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { router } from "./routes/router";
import { Toaster } from "sonner";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <>
      <Provider store={store}>
        <ProvidesTheme>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Toaster position="top-right" richColors closeButton />

            <RouterProvider router={router} />
          </LocalizationProvider>
        </ProvidesTheme>
      </Provider>
    </>
  );
}

export default App;
