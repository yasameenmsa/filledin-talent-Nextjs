import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from './models/User';
import dbConnect from './lib/db/mongodb';
import { resetLoginRateLimit } from './lib/middleware/rate-limiter';
import { logSecurityEvent, SecurityEventType } from './lib/utils/security-logger';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔍 [AUTH] Login attempt started');
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH] Missing email or password');
          return null;
        }

        console.log('🔍 [AUTH] Email:', credentials.email);

        try {
          await dbConnect();

          const user = await User.findOne({
            email: (credentials.email as string).toLowerCase()
          });

          console.log('👤 [AUTH] User found in DB?', !!user);

          if (!user) {
            console.log('❌ [AUTH] User not found in database');
            logSecurityEvent({
              type: SecurityEventType.LOGIN_FAILURE,
              email: (credentials.email as string).toLowerCase(),
              details: { reason: 'user_not_found' },
            });
            return null;
          }

          // Check if account is locked (direct check for backward compatibility)
          const isLocked = user.lockUntil && user.lockUntil > new Date();
          if (isLocked) {
            const lockTimeRemaining = user.lockUntil ? Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000) : 0;

            console.log('🔒 [AUTH] Account is locked for', lockTimeRemaining, 'minutes');

            logSecurityEvent({
              type: SecurityEventType.ACCOUNT_LOCKED,
              email: user.email,
              userId: user._id.toString(),
              details: { minutesRemaining: lockTimeRemaining },
            });

            // Return null but don't increment attempts
            return null;
          }

          console.log('🔐 [AUTH] Checking password...');
          const isPasswordValid = await user.comparePassword(credentials.password as string);
          console.log('🔐 [AUTH] Password valid?', isPasswordValid);

          if (!isPasswordValid) {
            // Increment failed login attempts (direct update for backward compatibility)
            const updates: any = { $inc: { loginAttempts: 1 } };
            const currentAttempts = user.loginAttempts || 0;

            // Lock the account if we've reached max attempts (5)
            if (currentAttempts + 1 >= 5 && !isLocked) {
              updates.$set = {
                lockUntil: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
              };
            }

            await user.updateOne(updates);

            console.log('❌ [AUTH] Invalid password. Attempts:', currentAttempts + 1);

            logSecurityEvent({
              type: SecurityEventType.LOGIN_FAILURE,
              email: user.email,
              userId: user._id.toString(),
              details: {
                reason: 'invalid_password',
                attempts: currentAttempts + 1,
              },
            });

            return null;
          }

          // Successful login - reset login attempts (direct update for backward compatibility)
          if (user.loginAttempts > 0 || user.lockUntil) {
            await user.updateOne({
              $set: { loginAttempts: 0 },
              $unset: { lockUntil: 1 },
            });
          }

          // Reset rate limiting for this user
          resetLoginRateLimit(user.email);

          logSecurityEvent({
            type: SecurityEventType.LOGIN_SUCCESS,
            email: user.email,
            userId: user._id.toString(),
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
          };
        } catch (error) {
          console.error('Auth error:', error);

          logSecurityEvent({
            type: SecurityEventType.LOGIN_FAILURE,
            email: (credentials.email as string).toLowerCase(),
            details: {
              reason: 'server_error',
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });

          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isEmailVerified = user.isEmailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});