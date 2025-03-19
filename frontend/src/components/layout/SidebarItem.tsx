import { ReactNode } from 'react';
import { ChevronRight } from 'react-feather';
import { Link } from 'react-router-dom';

interface SidebarItemProps {
  children: ReactNode;
  to: string;
  active?: boolean;
  className?: string;
}

export default function SidebarItem({
  children,
  to,
  active = false,
  className,
}: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={`${className} no-underline text-white bg-primary-red  rounded-md p-3 transition-colors`}
    >
      <span className="flex gap-5 bg-primary-red font-semibold">
        {children} {active ? <ChevronRight /> : null}
      </span>
    </Link>
  );
}
