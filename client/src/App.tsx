import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/hooks/themeProvider";
import { AuthProvider, PrivateRoutes } from "@/hooks/authProvider";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/errorBoundary";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Home from "@/components/home";
import Register from "@/components/auth/register";
import Login from "@/components/auth/login";
import { Dashboard, DashboardLoader } from "@/components/dashboard/dashboard";
import Playground from "@/components/playground";
import UserProfile from "@/components/userProfile";

const Router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
        <Home />
        <Footer />
      </>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/auth/register",
    element: <Register />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/auth/login",
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        path: "/dashboard",
        element: (
          <>
            <Header />
            <Dashboard />
            <Footer />
          </>
        ),
        loader: DashboardLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "/play",
        element: <Playground />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "/play/:did",
        element: <Playground />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "/users/:username",
        element: (
          <>
            <Header />
            <UserProfile />
            <Footer />
          </>
        ),
        errorElement: <ErrorBoundary />,
      },
    ]
  }
]);

function App() {
  return (
    <>
    <ThemeProvider>
    <AuthProvider>
      <RouterProvider router={Router} />
    </AuthProvider>
    </ThemeProvider>
    <Toaster richColors toastOptions={{}} />
    </>
  );
}

export default App
