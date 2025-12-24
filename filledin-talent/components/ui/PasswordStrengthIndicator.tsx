'use client';

import { useMemo } from 'react';
import { validatePassword, PasswordStrength } from '@/lib/auth/password-validator';

interface PasswordStrengthIndicatorProps {
    password: string;
    className?: string;
}

export function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
    const validation = useMemo(() => {
        if (!password) return null;
        return validatePassword(password);
    }, [password]);

    if (!validation || !password) return null;

    const getColor = () => {
        switch (validation.strength) {
            case PasswordStrength.STRONG:
                return 'bg-green-500';
            case PasswordStrength.MEDIUM:
                return 'bg-yellow-500';
            case PasswordStrength.WEAK:
                return 'bg-red-500';
            default:
                return 'bg-gray-300';
        }
    };

    const getTextColor = () => {
        switch (validation.strength) {
            case PasswordStrength.STRONG:
                return 'text-green-700';
            case PasswordStrength.MEDIUM:
                return 'text-yellow-700';
            case PasswordStrength.WEAK:
                return 'text-red-700';
            default:
                return 'text-gray-700';
        }
    };

    const getStrengthLabel = () => {
        switch (validation.strength) {
            case PasswordStrength.STRONG:
                return 'Strong';
            case PasswordStrength.MEDIUM:
                return 'Medium';
            case PasswordStrength.WEAK:
                return 'Weak';
            default:
                return '';
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Strength bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${getColor()}`}
                        style={{ width: `${validation.score}%` }}
                    />
                </div>
                <span className={`text-sm font-medium ${getTextColor()}`}>
                    {getStrengthLabel()}
                </span>
            </div>

            {/* Validation errors */}
            {validation.errors.length > 0 && (
                <ul className="text-xs text-gray-600 space-y-1">
                    {validation.errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-1">
                            <span className="text-red-500">•</span>
                            <span>{error}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Strength guidelines when password is valid */}
            {validation.isValid && validation.strength !== PasswordStrength.STRONG && (
                <p className="text-xs text-gray-600">
                    💡 Tip: Add more variety to make your password stronger
                </p>
            )}
        </div>
    );
}
