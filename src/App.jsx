import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/register';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import PrivateRoute from './components/privateroute';
import CreateClaim from './pages/createclaim';
import ClaimDetail from './pages/claimdetail';
import AgencyListing from './pages/AgencyListing';
import AgencySelection from './pages/AgencySelection';
import AssignmentConfirmation from './pages/AssignmentConfirmation';
import ClaimsList from './pages/ClaimList';
import AgencyRegister from './pages/AgencyRegister';
import AgencyLogin from './pages/AgencyLogin';
import AgencyDashboard from './pages/Agencydashboard';
import Chat from './pages/Chat';
import AgencyChat from './pages/AgencyChat';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
    <Layout>

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />

<Route path="/claims/create" element={
          <PrivateRoute><CreateClaim /></PrivateRoute>
        } />

<Route path="/claims/:id" element={
  <PrivateRoute><ClaimDetail /></PrivateRoute>
} />

<Route path="/claims" element={<ClaimsList />} />
<Route path="/agencies"            element={<AgencyListing />} />
<Route path="/agencies/select"     element={<AgencySelection />} />
<Route path="/assignments/confirm" element={<AssignmentConfirmation />} />
<Route path="/agency/register" element={<AgencyRegister />} />
<Route path="/agency/login" element={<AgencyLogin/>} />
<Route path='/chat' element={<Chat/>}/>
<Route path='/agency/chat' element={<AgencyChat/>}/>
<Route path="/agency/dashboard" element={<AgencyDashboard />} />
      </Routes>
</Layout>
    </BrowserRouter>
  );
}