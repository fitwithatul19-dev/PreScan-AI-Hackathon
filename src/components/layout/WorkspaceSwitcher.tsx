import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Check, Plus, Building2, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

export const WorkspaceSwitcher: React.FC = () => {
  const { organization, membership } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeWsName = organization?.name || 'Main Workspace';
  const role = membership?.role || 'OWNER';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 p-2 rounded-lg border border-neutral-200/80 bg-white hover:bg-neutral-50/80 transition-colors text-left group"
        aria-label="Select workspace"
      >
        <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
          <Building2 className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-900 truncate">
            {activeWsName}
          </p>
          <p className="text-[10px] text-neutral-400 font-medium">
            {role.charAt(0) + role.slice(1).toLowerCase()} • Free Tier
          </p>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 p-1 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            Active Workspace
          </div>
          <div className="flex items-center justify-between p-2 rounded-md bg-neutral-50 text-neutral-900 text-xs font-medium">
            <span className="truncate">{activeWsName}</span>
            <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
          </div>
          <div className="my-1 border-t border-neutral-100" />
          <div className="px-2.5 py-1 text-[10px] text-neutral-400 flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-neutral-400" />
            <span>Multi-Tenant Partitioned</span>
          </div>
        </div>
      )}
    </div>
  );
};
