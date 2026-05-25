import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ShopProvider } from "./contexts/ShopContext";
import Home from "./pages/Home";
import GuideBeforePage from "./pages/GuideBeforePage";
import StatusPage from "./pages/StatusPage";
import CompletePage from "./pages/CompletePage";
import StaffPage from "./pages/StaffPage";
import CheckinPage from "./pages/CheckinPage";
import GroomingSelectPage from "./pages/GroomingSelectPage";
import StaffLoginPage from "./pages/StaffLoginPage";
import HistoryPage from "./pages/HistoryPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import ShopEntryPage from "./pages/ShopEntryPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/guide" component={GuideBeforePage} />
      <Route path="/status/:id" component={StatusPage} />
      <Route path="/complete/:id" component={CompletePage} />
      <Route path="/staff" component={StaffPage} />
      <Route path="/checkin" component={CheckinPage} />
      <Route path="/grooming-select" component={GroomingSelectPage} />
      {/* PIN 인증 비활성화 - staff-login은 /staff로 리다이렉트 */}
      <Route path="/staff-login">{() => { window.location.replace("/staff"); return null; }}</Route>
      <Route path="/history" component={HistoryPage} />
      {/* 슬러그 기반 매장 진입 라우트 - shop_id 쿠키 설정 후 이동 */}
      <Route path="/s/:slug/staff-login">
        {(params) => <ShopEntryPage target="staff-login" />}
      </Route>
      <Route path="/s/:slug/staff">
        {(params) => <ShopEntryPage target="staff" />}
      </Route>
      <Route path="/s/:slug">
        {(params) => <ShopEntryPage target="checkin" />}
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ShopProvider>
            <Router />
          </ShopProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
