import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { DocsPage } from './pages/DocsPage';
import { HomePage } from './pages/HomePage';
import { RoadmapPage } from './pages/RoadmapPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="architecture" element={<ArchitecturePage />} />
        <Route path="docs" element={<DocsPage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
