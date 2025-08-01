import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import RoomDetail from './pages/RoomDetail';
import ParticipantResponse from './pages/ParticipantResponse';
import Results from './pages/Results';
import Layout from './components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateRoom />} />
            <Route path="/room/:id" element={<RoomDetail />} />
            <Route path="/room/:id/participate" element={<ParticipantResponse />} />
            <Route path="/room/:id/results" element={<Results />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
