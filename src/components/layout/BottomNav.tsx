"use client";

import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Monitor, Plus, Users, Settings as SettingsIcon } from 'lucide-react';

interface BottomNavProps {
  onTabChange: (id: string) => void;
  activeTab: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onTabChange, activeTab }) => {
  const {
    interfaceSettings,
    setSettingsOpen,
  } = useAppStore();

  const accentColor = interfaceSettings.accentColor;

  const tabs = [
    { id: 'streams', label: 'Streams', icon: <Monitor className="w-5 h-5" /> },
    { id: 'add', label: 'Add', icon: <Plus className="w-5 h-5" /> },
    { id: 'channels', label: 'Channels', icon: <Users className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const handleTabClick = (id: string) => {
    if (id === 'settings') {
      setSettingsOpen(true);
    } else {
      onTabChange(id);
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a12] border-t border-white/5 z-50 flex items-center justify-around px-2 animate-in slide-in-from-bottom duration-500">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className="flex flex-col items-center justify-center gap-1 min-w-[48px] h-full transition-colors"
            style={{ color: isActive ? accentColor : '#666' }}
          >
            {tab.icon}
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
