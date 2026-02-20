// src/components/booking/CodeInput.js
// 6-digit SMS verification code input with auto-advance.
import { useRef, useCallback } from 'react';
import { colors } from '@/components/preview/tokens';

const CODE_LENGTH = 6;

export default function CodeInput({ value = '', onChange, disabled, fonts }) {
  const refs = useRef([]);

  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] || '');

  const focusAt = useCallback((i) => {
    setTimeout(() => refs.current[i]?.focus(), 0);
  }, []);

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = char;
    const joined = next.join('');
    onChange(joined);
    if (char && i < CODE_LENGTH - 1) focusAt(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      focusAt(i - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (pasted) {
      onChange(pasted);
      focusAt(Math.min(pasted.length, CODE_LENGTH - 1));
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          disabled={disabled}
          className="text-center transition-all duration-150"
          style={{
            fontFamily: fonts?.body || 'system-ui',
            fontSize: '1.25rem',
            fontWeight: 700,
            width: 44,
            height: 52,
            borderRadius: '0.75rem',
            border: d
              ? `2px solid ${colors.violet}`
              : `1.5px solid #c4b8ae`,
            backgroundColor: disabled ? colors.cream : '#fff',
            color: colors.heading,
            outline: 'none',
            caretColor: colors.violet,
          }}
        />
      ))}
    </div>
  );
}
