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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Anmelden als
      </label>
      <div className="grid grid-cols-3 gap-3">
        {roles.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
            className={`
              px-4 py-3 rounded-lg border-2 font-medium transition-all
              ${
                selectedRole === role.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
              }
            `}
          >
            {role.label}
          </button>
        ))}
      </div>
    </div>
  );
}