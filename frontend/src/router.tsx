import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import PublicLayout from "./layouts/publicLayout.tsx";
import UserLayout from "./layouts/userLayout.tsx";
import AdminLayout from "./layouts/adminLayout.tsx";

// Composant de chargement
import { Loader } from "./components/ui/loader/Loader";

// Auth guards (petits, chargés immédiatement)
import { RequireAuth, RequireAdmin } from "./features/auth";

// Pages critiques pour le chargement initial (homepage uniquement)
import { HomePage } from "./features/dashboard";

// Lazy loading pour toutes les autres pages
const BookPage = lazy(() => import("./features/books").then(m => ({ default: m.BookPage })));
const UserBooks = lazy(() => import("./features/books").then(m => ({ default: m.UserBooks })));
const AdminBooks = lazy(() => import("./features/books").then(m => ({ default: m.AdminBooks })));

const LibraryPage = lazy(() => import("./features/libraries").then(m => ({ default: m.LibraryPage })));
const UserLibraries = lazy(() => import("./features/libraries").then(m => ({ default: m.UserLibraries })));
const AdminLibraries = lazy(() => import("./features/libraries").then(m => ({ default: m.AdminLibraries })));

const ReadingListPage = lazy(() => import("./features/reading-lists").then(m => ({ default: m.ReadingListPage })));
const UserLists = lazy(() => import("./features/reading-lists").then(m => ({ default: m.UserLists })));
const AdminLists = lazy(() => import("./features/reading-lists").then(m => ({ default: m.AdminLists })));

const UserReviews = lazy(() => import("./features/reviews").then(m => ({ default: m.UserReviews })));
const AdminReviews = lazy(() => import("./features/reviews").then(m => ({ default: m.AdminReviews })));

const UserHome = lazy(() => import("./features/dashboard").then(m => ({ default: m.UserHome })));
const AdminHome = lazy(() => import("./features/dashboard").then(m => ({ default: m.AdminHome })));
const AdminDashboard = lazy(() => import("./features/dashboard").then(m => ({ default: m.AdminDashboard })));

const LegalPage = lazy(() => import("./features/legal").then(m => ({ default: m.LegalPage })));
const UserStats = lazy(() => import("./features/stats").then(m => ({ default: m.UserStats })));
const AdminStats = lazy(() => import("./features/stats").then(m => ({ default: m.AdminStats })));

// Helper pour wrapper les routes lazy avec Suspense
const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => (
    <Suspense fallback={<Loader />}>
        <Component />
    </Suspense>
);



export const router = createBrowserRouter([
    {
        path: '/',
        element: <PublicLayout />,

        children: [
            { index: true, element: <HomePage /> },
            { path: 'legal', element: withSuspense(LegalPage) },
            { path: 'book/:id', element: withSuspense(BookPage) },
        ],
    },
    {
        path: '/user',
        element: (
            <RequireAuth>
                <UserLayout />
            </RequireAuth>
        ),
        children: [
            { index: true, element: <Navigate to="/user/home" replace /> },
            { path: 'home', element: withSuspense(UserHome) },
            { path: 'libraries', element: withSuspense(UserLibraries) },
            { path: 'lists', element: withSuspense(UserLists) },
            { path: 'books', element: withSuspense(UserBooks) },
            { path: 'reviews', element: withSuspense(UserReviews) },
            { path: 'stats', element: withSuspense(UserStats) },
            { path: 'legal', element: withSuspense(LegalPage) },
            { path: 'book/:id', element: withSuspense(BookPage) },
            { path: 'library/:id', element: withSuspense(LibraryPage) },
            { path: 'reading-list/:id', element: withSuspense(ReadingListPage) },
        ],
    },
    {
        path: '/admin',
        element: (
            <RequireAdmin>
                <AdminLayout />
            </RequireAdmin>
        ),
        children: [
            { index: true, element: <Navigate to="/admin/home" replace /> },
            { path: 'home', element: withSuspense(AdminHome) },
            { path: 'libraries', element: withSuspense(AdminLibraries) },
            { path: 'lists', element: withSuspense(AdminLists) },
            { path: 'books', element: withSuspense(AdminBooks) },
            { path: 'reviews', element: withSuspense(AdminReviews) },
            { path: 'stats', element: withSuspense(AdminStats) },
            { path: 'dashboard', element: withSuspense(AdminDashboard) },
            { path: 'legal', element: withSuspense(LegalPage) },
            { path: 'book/:id', element: withSuspense(BookPage) },
            { path: 'library/:id', element: withSuspense(LibraryPage) },
            { path: 'reading-list/:id', element: withSuspense(ReadingListPage) },
        ],
    },
])