import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x && x !== "admin");

  const formatName = (segment) => {
    if (!segment) return "Dashboard";
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
      <Link to="/admin/dashboard" className="flex items-center gap-1 hover:text-slate-900 transition">
        <Home className="w-3.5 h-3.5 stroke-[2]" />
        <span>Admin</span>
      </Link>
      {pathnames.length > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
      {pathnames.map((name, idx) => {
        const routeTo = `/admin/${pathnames.slice(0, idx + 1).join("/")}`;
        const isLast = idx === pathnames.length - 1;

        return (
          <React.Fragment key={name}>
            {isLast ? (
              <span className="font-bold text-slate-900 truncate max-w-[150px] sm:max-w-[250px]">
                {formatName(name)}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-slate-900 transition">
                {formatName(name)}
              </Link>
            )}
            {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
