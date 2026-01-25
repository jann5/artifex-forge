import * as React from 'react';
import { motion, Variants } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';

// 2. Define Prop Types
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
  logoutItem: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// 3. Define Animation Variants
const sidebarVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.05,
      duration: 0.2
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

const MotionLink = motion(Link);

// 4. Create the Component
export const UserProfileSidebar = React.forwardRef<HTMLDivElement, UserProfileSidebarProps>(
  ({ user, navItems, logoutItem, className }, ref) => {
    return (
      <motion.aside
        ref={ref}
        className={cn(
          'flex h-full w-full max-w-xs flex-col rounded-xl border bg-card p-4 text-card-foreground shadow-lg',
          className
        )}
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        aria-label="Menu użytkownika"
      >
        {/* User Info Header */}
        <motion.div variants={itemVariants} className="flex items-center space-x-4 p-2">
          <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex items-center justify-center border">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.name}'s avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-muted-foreground">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className="flex flex-col truncate min-w-0">
            <span className="font-semibold text-lg truncate">{user.name || 'Użytkownik'}</span>
            <span className="text-sm text-muted-foreground truncate">{user.email}</span>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="my-4 border-t border-border" />
        
        {/* Navigation Links */}
        <nav className="flex-1 space-y-1" role="navigation">
          {navItems.map((item, index) => (
            <React.Fragment key={index}>
              {item.isSeparator && <motion.div variants={itemVariants} className="h-4" />}
              <MotionLink
                to={item.href}
                variants={itemVariants}
                className="group flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors">{item.icon}</span>
                <span>{item.label}</span>
                <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </MotionLink>
            </React.Fragment>
          ))}
        </nav>
        
        <motion.div variants={itemVariants} className="my-2 border-t border-border" />

        {/* Logout Button */}
        <motion.div variants={itemVariants} className="mt-2">
          <button
            onClick={logoutItem.onClick}
            className="group flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <span className="mr-3 h-5 w-5">{logoutItem.icon}</span>
            <span>{logoutItem.label}</span>
          </button>
        </motion.div>
      </motion.aside>
    );
  }
);

UserProfileSidebar.displayName = 'UserProfileSidebar';