"use client";
import Link from "next/link";
import { Home, Bed, UserPlus, Calendar } from "lucide-react";

const Sidebar = () => {

  const menuItems= [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Rooms", icon: Bed, href: "/rooms" },
    { label: "Onboarding", icon: UserPlus, href: "/onboarding"},
    { label: "Bookings", icon: Calendar, href: "/bookings"},
  ];

  return (
    <div
      className={`text-white transition-all duration-300 fixed top-0 w-[86px]
      h-screen flex flex-col items-center justify-between`}
      style={{
        background: "linear-gradient(180deg, #4286F2 0%, #34A753 100%)"
      }}
    >
      <div>
        <aside className={`flex items-center justify-center mt-20 mb-8`}>
         <nav className="flex flex-col gap-4">
      {menuItems.map(({ label, icon: Icon, href }) => (
        <Link key={label} href={href}>
          <div className="flex flex-col items-center my-2 text-white">
            <Icon className="w-6 h-6 mb-1" />
            <span>{label}</span>
          </div>
        </Link>
      ))}
    </nav>
  
        </aside>
      </div>

    </div>
  );
};

export default Sidebar;