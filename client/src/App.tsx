import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/themeProvider";
import { AuthProvider } from "@/contexts/authProvider";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/errorBoundary";
import Header from "@/components/header";
import Footer from "@/components/footer";
import PrivateRoutes from "@/components/privateRoutes";
import Home from "@/routes/home";
import Register from "@/routes/auth/register";
import Login from "@/routes/auth/login";
import { Dashboard, DashboardLoader } from "@/routes/dashboard/page";
import { Deck, DeckLoader } from "@/routes/deck/page";
import { UserProfile, UserProfileLoader } from "@/routes/userProfile";
import { Playground, PlaygroundLoader } from "@/routes/playground";
import { Settings, SettingsLoader } from "@/routes/settings/page";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
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
        path: "/deck/:did",
        element: (
          <>
            <Header />
            <Deck />
            <Footer />
          </>
        ),
        loader: DeckLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "/play",
        element: (
          <>
            <Header />
            <Playground />
          </>
        ),
        loader: PlaygroundLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "/play/:did",
        element: (
          <>
            <Header />
            <Playground />
          </>
        ),
        loader: PlaygroundLoader,
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
        loader: UserProfileLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "/settings",
        element: (
          <>
            <Header />
            <Settings />
            <Footer />
          </>
        ),
        loader: SettingsLoader,
        errorElement: <ErrorBoundary />,
      },
      {
        path: "/settings/:name",
        element: (
          <>
            <Header />
            <Settings />
            <Footer />
          </>
        ),
        loader: SettingsLoader,
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
