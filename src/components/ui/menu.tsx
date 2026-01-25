import * as React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';
import { LogOut } from 'lucide-react';

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  isSeparator?: boolean;
}

export interface UserProfile {
  name?: string;
  email?: string;
  avatarUrl?: string;
}

interface UserProfileSidebarProps {
  user: UserProfile;
  navItems: NavItem[];
  logoutItem?: {
    icon?: React.ReactNode;
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const UserProfileSidebar = React.forwardRef<HTMLDivElement, UserProfileSidebarProps>(
  ({ user, navItems, logoutItem, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full flex-col bg-card text-card-foreground',
          className
        )}
      >
        {/* User Info Header */}
        <div className="flex items-center gap-3 p-4 pb-2">
          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center border shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.name}'s avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-muted-foreground">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="font-semibold text-sm truncate">{user.name || 'Użytkownik'}</span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
          </div>
        </div>
        
        <div className="my-2 border-t border-border/50 mx-4" />
        
        {/* Navigation Links */}
        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.isSeparator ? (
                 <div className="my-2 border-t border-border/50 mx-2" />
              ) : (
                <Link
                  to={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span className="h-4 w-4 text-muted-foreground/70">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
        
        {/* Logout Button */}
        {logoutItem && (
          <div className="mt-2 px-2 pb-2">
            <button
              onClick={logoutItem.onClick}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <span className="h-4 w-4">
                {logoutItem.icon || <LogOut className="h-4 w-4" />}
              </span>
              <span>{logoutItem.label}</span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

UserProfileSidebar.displayName = 'UserProfileSidebar';