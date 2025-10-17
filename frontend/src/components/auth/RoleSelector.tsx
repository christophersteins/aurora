'use client';

import React from 'react';
import { UserRole, USER_ROLE_LABELS } from '@/types/user-role.enum';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onChange: (role: UserRole) => void;
}

export default function RoleSelector({ selectedRole, onChange }: RoleSelectorProps) {
  const roles = [
    { value: UserRole.CUSTOMER, label: USER_ROLE_LABELS[UserRole.CUSTOMER] },
    { value: UserRole.ESCORT, label: USER_ROLE_LABELS[UserRole.ESCORT] },
    { value: UserRole.BUSINESS, label: USER_ROLE_LABELS[UserRole.BUSINESS] },
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-heading">
        Anmelden als
      </label>
      <div className="grid grid-cols-3 gap-3">
        {roles.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={`
              px-4 py-3 rounded-full border font-medium transition-all
              ${
                selectedRole === role.value
                  ? 'text-black border-primary'
                  : 'bg-transparent text-text-button border-border hover:bg-opacity-50 hover:border-text-secondary'
              }
            `}
            style={selectedRole === role.value ? { 
              backgroundColor: '#00d4ff',
              borderColor: '#00d4ff' 
            } : {
              backgroundColor: 'transparent',
              borderColor: '#2f3336'
            }}
          >
            {role.label}
          </button>
        ))}
      </div>
    </div>
  );
}