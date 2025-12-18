
import React, { useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface OTPInputProps {
     maxLength?: number;
     onComplete: (code: string) => void;
     onChange: (code: string) => void;
     value: string;
     disabled?: boolean;
}

export function OTPInput({
     maxLength = 6,
     onComplete,
     onChange,
     value,
     disabled = false
}: OTPInputProps) {
     const inputs = useRef<(HTMLInputElement | null)[]>([]);

     const focusNext = (index: number) => {
          if (index < maxLength - 1) {
               inputs.current[index + 1]?.focus();
          }
     };

     const focusPrev = (index: number) => {
          if (index > 0) {
               inputs.current[index - 1]?.focus();
          }
     };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
          const val = e.target.value;

          // Allow only numbers
          if (val && !/^\d+$/.test(val)) return;

          const newValue = value.split('');

          // Handle pasting or multiple chars (take last char)
          const char = val.slice(-1);
          newValue[index] = char;

          const newCode = newValue.join('').slice(0, maxLength);
          onChange(newCode);

          if (char) {
               if (index < maxLength - 1) {
                    focusNext(index);
               } else if (newCode.length === maxLength) {
                    onComplete(newCode);
               }
          }
     };

     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
          if (e.key === 'Backspace') {
               if (!value[index] && index > 0) {
                    focusPrev(index);
               } else {
                    const newValue = value.split('');
                    newValue[index] = '';
                    onChange(newValue.join(''));
               }
          } else if (e.key === 'ArrowLeft') {
               focusPrev(index);
          } else if (e.key === 'ArrowRight') {
               focusNext(index);
          }
     };

     // Auto-focus first input when component mounts if empty
     useEffect(() => {
          if (!value && !disabled) {
               inputs.current[0]?.focus();
          }
     }, []);

     return (
          <div className="flex gap-2 justify-center">
               {Array.from({ length: maxLength }).map((_, index) => (
                    <input
                         key={index}
                         ref={(el) => { inputs.current[index] = el; }}
                         type="text"
                         inputMode="numeric"
                         maxLength={1}
                         value={value[index] || ''}
                         onChange={(e) => handleChange(e, index)}
                         onKeyDown={(e) => handleKeyDown(e, index)}
                         disabled={disabled}
                         autoFocus={index === 0}
                         className={cn(
                              "w-12 h-14 text-center text-2xl font-bold bg-background/50 border border-input rounded-md ring-offset-background transition-all",
                              "focus:border-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 outline-none",
                              "disabled:cursor-not-allowed disabled:opacity-50"
                         )}
                    />
               ))}
          </div>
     );
}
