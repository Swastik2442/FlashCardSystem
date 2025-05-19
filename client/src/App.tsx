import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/contexts/themeProvider"
import { AuthProvider } from "@/contexts/authProvider"
import { FeaturesProvider } from "@/contexts/featuresProvider"
import { Toaster } from "@/components/ui/sonner"
import ErrorBoundary from "@/components/errorBoundary"
import Header from "@/components/header"
import Footer from "@/components/footer"
import PrivateRoutes from "@/components/privateRoutes"
import Home from "@/routes/home"
import Register from "@/routes/auth/register"
import Login from "@/routes/auth/login"
import { Dashboard, DashboardLoader } from "@/routes/dashboard/page"
import { Deck, DeckLoader } from "@/routes/deck/page"
import { UserProfile, UserProfileLoader } from "@/routes/userProfile"
import { Playground, PlaygroundLoader } from "@/routes/playground"
import { Settings, SettingsLoader } from "@/routes/settings/page"

const queryClient = new QueryClient()

const RoutesWithHeaderFooter = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
)

const Router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/auth/register",
    element: <Register />,
    errorElement: <ErrorBoundary />
  },
  {
    path: "/auth/login",
    element: <Login />,
    errorElement: <ErrorBoundary />
  },
  {
    element: <PrivateRoutes />,
    children: [
      {
        path: "/play",
        element: (
          <>
            <Header />
            <Playground />
          </>
        ),
        loader: PlaygroundLoader,
        errorElement: <ErrorBoundary />
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
        errorElement: <ErrorBoundary />
      },
      {
        element: <RoutesWithHeaderFooter />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
            loader: DashboardLoader,
            errorElement: <ErrorBoundary />
          },
          {
            path: "/deck/:did",
            element: <Deck />,
            loader: DeckLoader,
            errorElement: <ErrorBoundary />
          },
          {
            path: "/users/:username",
            element: <UserProfile />,
            loader: UserProfileLoader,
            errorElement: <ErrorBoundary />
          },
          {
            path: "/settings",
            element: <Settings />,
            loader: SettingsLoader,
            errorElement: <ErrorBoundary />
          },
          {
            path: "/settings/:name",
            element: <Settings />,
            loader: SettingsLoader,
            errorElement: <ErrorBoundary />
          }
        ]
      }
    ]
  }
])

function App() {
  return (
    <>
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <AuthProvider>
    <FeaturesProvider>
      <RouterProvider router={Router} />
    </FeaturesProvider>
    </AuthProvider>
    </ThemeProvider>
    </QueryClientProvider>
    <Toaster richColors toastOptions={{}} />
    </>
  )
}

export default App
