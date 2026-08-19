import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { AddTransaction } from './pages/AddTransaction'
import { Debts } from './pages/Debts'
import { AddDebt } from './pages/AddDebt'
import { DebtDetail } from './pages/DebtDetail'
import { Settings } from './pages/Settings'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/debts/new" element={<AddDebt />} />
          <Route path="/debts/:id" element={<DebtDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
