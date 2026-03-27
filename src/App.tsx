import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { RFQList } from '@/pages/RFQList'
import { RFQDetail } from '@/pages/RFQDetail'
import { POList } from '@/pages/POList'
import { PODetail } from '@/pages/PODetail'
import { EmailCenter } from '@/pages/EmailCenter'
import { Customers } from '@/pages/Customers'
import { Suppliers } from '@/pages/Suppliers'
import { Parts } from '@/pages/Parts'
import { Settings } from '@/pages/Settings'
import { DesignPreview } from '@/pages/DesignPreview'
import { PriceSearch } from '@/pages/PriceSearch'
import { SupplierItemPrices } from '@/pages/SupplierItemPrices'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rfq" element={<RFQList />} />
          <Route path="/rfq/:id" element={<RFQDetail />} />
          <Route path="/po" element={<POList />} />
          <Route path="/po/:id" element={<PODetail />} />
          <Route path="/email" element={<EmailCenter />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/vessels" element={<Parts />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/prices" element={<PriceSearch />} />
          <Route path="/supplier-prices" element={<SupplierItemPrices />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/design" element={<DesignPreview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
