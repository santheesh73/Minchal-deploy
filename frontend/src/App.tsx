import { BrowserRouter } from 'react-router-dom';
import { AuditProvider } from './store/AuditContext';
import { AppLayout } from './components/layout/AppLayout';
import { AppRoutes } from './routes/AppRoutes';
import { SplashScreen } from './components/common/SplashScreen';

function App() {
  return (
    <BrowserRouter>
      <AuditProvider>
        <SplashScreen />
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </AuditProvider>
    </BrowserRouter>
  );
}

export default App;