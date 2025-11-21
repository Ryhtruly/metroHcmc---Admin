import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "infrastructure": "Infrastructure Management",
      "lines": "Metro Lines",
      "stations": "Stations",
      "vehicles": "Vehicles",
      "tickets_pricing": "Tickets & Pricing",
      "promotions": "Promotions",
      "settings_log": "Settings & Logs",
      "appearance": "Appearance",
      "stats_report": "Statistics & Reports",
      "welcome": "Welcome",
      "logout": "Logout",
      "revenue_today": "Revenue Today",
      "passengers": "Passengers",
      "tickets_scanned": "Tickets Scanned",
      "recent_activity": "Recent Activity",
      "system_overview": "System Overview",
      "stable_operation": "Stable Operation",
      "compare_yesterday": "+15% vs yesterday",
      "rush_hour": "+5% rush hour",
    }
  },
  vi: {
    translation: {
      "dashboard": "Tổng quan",
      "infrastructure": "Quản lý Hạ tầng", 
      "lines": "Tuyến Metro", 
      "stations": "Nhà Ga",
      "vehicles": "Phương tiện",
      "tickets_pricing": "Loại Vé & Giá",
      "promotions": "Khuyến mãi",
      "settings_log": "Cấu hình & Log",
      "appearance": "Giao diện",
      "stats_report": "Thống kê & Báo cáo",
      "welcome": "Xin chào",
      "logout": "Đăng xuất",
      "revenue_today": "Doanh thu hôm nay",
      "passengers": "Lượt khách",
      "tickets_scanned": "Vé đã quét",
      "recent_activity": "Hoạt động gần đây",
      "system_overview": "Tổng quan hệ thống",
      "stable_operation": "Hoạt động ổn định",
      "compare_yesterday": "+15% so với hôm qua",
      "rush_hour": "+5% giờ cao điểm",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('theme_locale') || 'vi',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;