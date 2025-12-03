import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import { validatePassword } from '@/lib/auth/password-validator';
import { checkRegisterRateLimit, getClientIdentifier } from '@/lib/middleware/rate-limiter';
import { logSecurityEvent, SecurityEventType, getClientInfo } from '@/lib/utils/security-logger';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name, role } = body;

        // Get client info for security logging
        const clientInfo = getClientInfo(request);
        const clientId = getClientIdentifier(request);

        // Check rate limiting
        const rateLimitCheck = checkRegisterRateLimit(clientId);
        if (rateLimitCheck.isLimited) {
            logSecurityEvent({
                type: SecurityEventType.RATE_LIMIT_EXCEEDED,
                email: email || 'unknown',
                ...clientInfo,
                details: {
                    endpoint: 'register',
                    resetTime: new Date(rateLimitCheck.resetTime).toISOString(),
                },
            });

            return NextResponse.json(
                {
                    message: 'Too many registration attempts. Please try again later.',
                    resetTime: rateLimitCheck.resetTime,
                },
                { status: 429 }
            );
        }

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            logSecurityEvent({
                type: SecurityEventType.REGISTER_FAILURE,
                email: email.toLowerCase(),
                ...clientInfo,
                details: {
                    reason: 'weak_password',
                    errors: passwordValidation.errors,
                },
            });

            return NextResponse.json(
                {
                    message: 'Password does not meet security requirements',
                    errors: passwordValidation.errors,
                },
                { status: 400 }
            );
        }

        // Connect to database
        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            logSecurityEvent({
                type: SecurityEventType.REGISTER_FAILURE,
                email: email.toLowerCase(),
                ...clientInfo,
                details: { reason: 'email_exists' },
            });

            return NextResponse.json(
                { message: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Create new user (password will be hashed by the pre-save hook)
        const user = await User.create({
            email: email.toLowerCase(),
            password: password, // Will be hashed automatically by User model's pre-save hook
            name: name || email.split('@')[0],
            role: role || 'job_seeker',
            isEmailVerified: true, // Changed to true by default
        });

        // Log successful registration
        logSecurityEvent({
            type: SecurityEventType.REGISTER_SUCCESS,
            email: user.email,
            userId: user._id.toString(),
            ...clientInfo,
        });

        // Return success response (exclude password)
        return NextResponse.json(
            {
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);

        logSecurityEvent({
            type: SecurityEventType.REGISTER_FAILURE,
            ...getClientInfo(request),
            details: {
                reason: 'server_error',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });

        return NextResponse.json(
            { message: 'Internal server error during registration' },
            { status: 500 }
        );
    }
}
