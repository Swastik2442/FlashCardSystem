import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/hooks/themeProvider";
import { AuthProvider, PrivateRoutes } from "@/hooks/authProvider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Home from "@/components/home";
import Register from "@/components/register";
import Login from "@/components/login";
import { Dashboard, DashboardLoader } from "@/components/dashboard";
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
  },
  {
    path: "/auth/register",
    element: <Register />,
  },
  {
    path: "/auth/login",
    element: <Login />,
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
      },
      {
        path: "/play",
        element: <Playground />,
      },
      {
        path: "/play/:did",
        element: <Playground />,
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
