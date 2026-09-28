import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r bg-white">
      <div className="px-5 py-4 border-b">
        <div className="text-2xl">🍳</div>
        <div className="font-bold text-gray-900">Cookbook Admin</div>
      </div>
      <nav className="p-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          // `end` chi dung o muc goc "/" - con lai de NavLink khop ca trang con
          // (vi du "/recipes" phai highlight khi dang o "/recipes/pending").
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50',
              ].join(' ')
            }
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
