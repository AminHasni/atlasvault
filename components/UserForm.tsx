import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Mail, User as UserIcon, Phone, Shield, Lock } from 'lucide-react';

interface UserFormProps {
  initialData?: User;
  onSubmit: (user: User) => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    role: initialData?.role || 'user' as UserRole,
    password: initialData?.password || '' 
  });

  const isEditing = !!initialData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userPayload: User = {
        id: initialData?.id || '', // Handled by service if empty
        createdAt: initialData?.createdAt || 0, // Handled by service if 0
        ...formData
    };
    onSubmit(userPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="john@example.com"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="+1234567890"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Role</label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
             {isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!isEditing}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all"
        >
          {isEditing ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};