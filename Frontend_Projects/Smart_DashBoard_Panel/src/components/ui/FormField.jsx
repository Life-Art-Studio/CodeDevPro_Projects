import React from 'react';

const FormField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">{label}</label>
    <input 
      {...props} 
      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[40px]" 
    />
  </div>
);

export default FormField;
