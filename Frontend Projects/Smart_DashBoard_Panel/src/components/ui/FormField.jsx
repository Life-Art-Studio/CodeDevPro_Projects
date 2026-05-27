import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function FormField({ label, name, type = 'text', error, isValid, hint, required, children, options, ...props }) {
  // Common styles for inputs
  const baseInputStyles = "w-full min-h-[48px] px-4 py-3 rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-base focus:outline-none transition-colors";
  const defaultBorder = "border-zinc-300 dark:border-zinc-700 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-600 dark:focus:ring-indigo-500";
  const errorBorder = "border-red-500 dark:border-red-500/50 focus:border-red-600 focus:ring-1 focus:ring-red-600";
  
  const isSelect = type === 'select';
  const isTextarea = type === 'textarea';

  let selectOptions = options || [];
  if (isSelect && !options && children) {
    selectOptions = React.Children.toArray(children)
      .filter(child => React.isValidElement(child) && child.type === 'option')
      .map(child => ({
        value: child.props.value,
        label: child.props.children
      }));
  }

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor={name}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {isSelect ? (
          <CustomSelect 
            value={props.value || props.defaultValue}
            onChange={(val) => {
              if (props.onChange) {
                props.onChange({ target: { name, value: val } });
              }
            }}
            options={selectOptions}
            disabled={props.disabled}
            className={`${baseInputStyles} ${error ? errorBorder : defaultBorder}`}
          />
        ) : isTextarea ? (
          <textarea 
            id={name} 
            name={name} 
            className={`${baseInputStyles} ${error ? errorBorder : defaultBorder} min-h-[100px] py-3`}
            {...props}
          />
        ) : (
          <input 
            id={name} 
            name={name} 
            type={type}
            className={`${baseInputStyles} ${error ? errorBorder : defaultBorder} ${isValid ? 'pr-10' : ''}`}
            {...props}
          />
        )}
        
        {/* Success Icon */}
        {isValid && !error && !isSelect && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        )}
      </div>

      {error ? (
        <p className="flex items-center gap-1.5 mt-1.5 text-sm md:text-xs text-red-600 dark:text-red-400 animate-slide-up-fade">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-sm md:text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
