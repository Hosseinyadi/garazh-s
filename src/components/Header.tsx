import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navigationItems = [
    { name: 'خانه', href: '/' },
    { name: 'اجاره', href: '/rent' },
    { name: 'فروش', href: '/sale' },
    { name: 'قطعات و خدمات', href: '/shop' },
    { name: 'تماس', href: '/contact' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Minimal Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center ml-3">
              <span className="text-white font-bold text-sm">گ</span>
            </div>
            <h1 className="text-lg font-bold gradient-text">گاراژ سنگین</h1>
          </div>

          {/* Clean Navigation */}
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Simple Actions */}
          <div className="hidden md:flex items-center space-x-3 space-x-reverse">
            <NotificationBell />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-sm">
                    <User className="w-4 h-4 ml-2" />
                    {user?.name || 'پنل کاربری'}
                  </Button>
                </Link>
                <Link to="/seller">
                  <Button variant="outline" size="sm" className="text-sm">
                    پنل فروشنده
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="text-sm">
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-sm">
                    ورود/ثبت‌نام
                  </Button>
                </Link>
                <Link to="/post-ad">
                  <Button size="sm" className="text-sm">
                    ثبت آگهی
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`p-2 text-sm font-medium rounded-lg transition-colors hover:bg-muted ${
                    location.pathname === item.href ? 'text-primary bg-muted' : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard">
                      <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                        <User className="w-4 h-4 ml-2" />
                        پنل کاربری
                      </Button>
                    </Link>
                    <Link to="/seller">
                      <Button variant="outline" size="sm" className="w-full text-sm">
                        پنل فروشنده
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-sm">
                      <LogOut className="w-4 h-4 ml-2" />
                      خروج
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                        ورود/ثبت‌نام
                      </Button>
                    </Link>
                    <Link to="/post-ad">
                      <Button size="sm" className="w-full text-sm">
                        ثبت آگهی
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;