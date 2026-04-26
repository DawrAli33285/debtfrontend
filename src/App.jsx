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
import SubscriptionPlans from './pages/BusinessSubscription';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import AgencySubscriptionPlans from './pages/AgencySubscription';
import AgencyClaimDetail from './pages/Agencyclaimdetails';
import ClaimEdit from './pages/claimedit';
import SuperAdminLogin from './pages/AdminLogin';
import SuperAdminRegister from './pages/AdminRegister';
import SuperAdminReset from './pages/AdminReset';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/AdminUserManagement';
import AgencyManagement from './pages/AdminAgencyManagement';
import ResetPassword from './pages/reset';
import AgencyResetPassword from './pages/AgencyReset';
import ClaimConnections from './pages/AdminClaimManagement';
import BuinsessAccount from './pages/BusinessAccount';

const stripePromise = loadStripe("pk_test_51SRynCPBwgTANTk6OM3ADMEkOYuyTGcfBfz92xAXVsLmm8O6tH7dCVgcwhG4rmi5OH3URGSa6faVFD2WYbI7E8oA00drLGc9l6");

export default function App() {
  return (
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <Routes>

          {/* ── Admin routes (no Layout) ── */}
          <Route path='/admin/login'            element={<SuperAdminLogin />} />
          <Route path='/admin/register'         element={<SuperAdminRegister />} />
          <Route path='/admin/reset'            element={<SuperAdminReset />} />
          <Route path='/admin/dashboard'        element={<AdminDashboard />} />
          <Route path='/admin/usermanagement'   element={<UserManagement />} />
          <Route path='/admin/agencymanagement' element={<AgencyManagement />} />
          <Route path='/admin/claimanagement' element={<ClaimConnections/>}/>
          {/* ── All other routes (wrapped in Layout) ── */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                
                <Route path="/register"          element={<Register />} />
                <Route path="/login"             element={<Login />} />
                <Route path="/agency/login"      element={<AgencyLogin />} />
                <Route path='/reset' element={<ResetPassword/>}/>
                <Route path="/business-plans"    element={<SubscriptionPlans />} />
                <Route path="/dashboard"         element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path='/account' element={<BuinsessAccount/>}/>
                <Route path="/claims/create"     element={<PrivateRoute><CreateClaim /></PrivateRoute>} />
                <Route path="/claims/:id"        element={<PrivateRoute><ClaimDetail /></PrivateRoute>} />
                <Route path="/edit-claim/:id"    element={<PrivateRoute><ClaimEdit /></PrivateRoute>} />
                <Route path="/claims"            element={<ClaimsList />} />
                <Route path="/agencies"          element={<AgencyListing />} />
                <Route path="/agencies/select"   element={<AgencySelection />} />
                <Route path="/assignments/confirm" element={<AssignmentConfirmation />} />
                <Route path="/agency/register"   element={<AgencyRegister />} />
              <Route path='/agency/reset' element={<AgencyResetPassword/>}/>
               
                <Route path="/chat"              element={<Chat />} />
                <Route path="/agency/chat"       element={<AgencyChat />} />
                <Route path="/agency/subscription" element={<AgencySubscriptionPlans />} />
                <Route path="/agency/dashboard"  element={<AgencyDashboard />} />
                <Route path="/agency-claims/:id" element={<AgencyClaimDetail />} />
              </Routes>
            </Layout>
          } />

        </Routes>
      </Elements>
    </BrowserRouter>
  );
}