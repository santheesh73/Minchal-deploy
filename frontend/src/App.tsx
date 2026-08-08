import { BrowserRouter } from 'react-router-dom';
import { AuditProvider } from './store/AuditContext';
import { AppLayout } from './components/layout/AppLayout';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuditProvider>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </AuditProvider>
    </BrowserRouter>
  );
}

export default App;