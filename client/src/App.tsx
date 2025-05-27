import { lazy } from "react"
import { preconnect } from "react-dom"
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "@/contexts/themeProvider"
import { AuthProvider } from "@/contexts/authProvider"
import { FeaturesProvider } from "@/contexts/featuresProvider"
import { Toaster } from "@/components/ui/sonner"
import { SettingsLoader } from "@/routes/settings/page"

const PrivateRoutes = lazy(() => import("@/components/privateRoutes"))
const ErrorBoundary = lazy(() => import("@/components/errorBoundary"))
const Header = lazy(() => import("@/components/header"))
const Footer = lazy(() => import("@/components/footer"))
const Home = lazy(() => import("@/routes/home"))
const Register = lazy(() => import("@/routes/auth/register"))
const Login = lazy(() => import("@/routes/auth/login"))
const Dashboard = lazy(() => import("@/routes/dashboard/page").then(m => ({ default: m.Dashboard })))
const Deck = lazy(() => import("@/routes/deck/page").then(m => ({ default: m.Deck })))
const UserProfile = lazy(() => import("@/routes/userProfile").then(m => ({ default: m.UserProfile })))
const Playground = lazy(() => import("@/routes/playground").then(m => ({ default: m.Playground })))
const Settings = lazy(() => import("@/routes/settings/page").then(m => ({ default: m.Settings })))

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
        errorElement: <ErrorBoundary />
      },
      {
        element: <RoutesWithHeaderFooter />,
        children: [
          {
            path: "/dashboard",
            element: <Dashboard />,
            errorElement: <ErrorBoundary />
          },
          {
            path: "/deck/:did",
            element: <Deck />,
            errorElement: <ErrorBoundary />
          },
          {
            path: "/users/:username",
            element: <UserProfile />,
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
  preconnect(import.meta.env.VITE_SERVER_HOST)
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
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    <Toaster richColors toastOptions={{}} />
    </>
  )
}

export default App
