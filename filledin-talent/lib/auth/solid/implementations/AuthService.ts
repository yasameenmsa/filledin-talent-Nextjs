// import { 
//   IAuthService,
//   AuthenticationRequest,
//   AuthenticationResult,
//   RegistrationRequest,
//   RegistrationResult,
//   PasswordResetRequest,
//   EmailVerificationRequest,
//   TokenRefreshRequest,
//   LogoutRequest,
//   UserProfileResult
// } from '../interfaces/IAuthService';
// import { IAuthProviderRegistry } from '../interfaces/IAuthProviderRegistry';
// import { IUserValidator } from '../interfaces/IUserValidator';
// import { ISessionManager } from '../interfaces/ISessionManager';
// import { ITokenService } from '../interfaces/ITokenService';
// import { IPasswordService } from '../interfaces/IPasswordService';
// import { IDependencyContainer } from '../interfaces/IDependencyContainer';
// import { connectToDatabase } from '../../../db/mongodb';
// import User from '../../../../models/User';

// /**
//  * Main authentication service that orchestrates all authentication operations
//  * Follows SOLID principles and uses dependency injection
//  */
// export class AuthService implements IAuthService {
//   constructor(
//     private readonly providerRegistry: IAuthProviderRegistry,
//     private readonly userValidator: IUserValidator,
//     private readonly sessionManager: ISessionManager,
//     private readonly tokenService: ITokenService,
//     private readonly passwordService: IPasswordService,
//     private readonly container: IDependencyContainer
//   ) {}

//   async authenticate(request: AuthenticationRequest): Promise<AuthenticationResult> {
//     try {
//       // Get the appropriate provider
//       const provider = request.provider 
//         ? this.providerRegistry.getProvider(request.provider)
//         : this.providerRegistry.getDefaultProvider();

//       if (!provider) {
//         return {
//           success: false,
//           error: {
//             code: 'PROVIDER_NOT_FOUND',
//             message: request.provider 
//               ? `Authentication provider '${request.provider}' not found`
//               : 'No default authentication provider configured'
//           }
//         };
//       }

//       // Validate provider is enabled
//       if (!provider.isEnabled()) {
//         return {
//           success: false,
//           error: {
//             code: 'PROVIDER_DISABLED',
//             message: `Authentication provider '${provider.getName()}' is disabled`
//           }
//         };
//       }

//       // Perform authentication using the provider
//       const authResult = await provider.authenticate({
//         email: request.email,
//         password: request.password,
//         code: request.code,
//         username: request.username,
//         userAgent: request.metadata?.userAgent,
//         ipAddress: request.metadata?.ipAddress
//       });

//       if (!authResult.success) {
//         return {
//           success: false,
//           error: {
//             code: authResult.error?.code || 'AUTH_FAILED',
//             message: authResult.error?.message || 'Authentication failed'
//           }
//         };
//       }

//       return {
//         success: true,
//         user: authResult.user!,
//         tokens: authResult.tokens!,
//         sessionId: authResult.tokens!.sessionId
//       };

//     } catch (error) {
//       console.error('Authentication error:', error);
//       return {
//         success: false,
//         error: {
//           code: 'SERVER_ERROR',
//           message: 'Authentication failed due to server error'
//         }
//       };
//     }
//   }

//   async register(request: RegistrationRequest): Promise<RegistrationResult> {
//     try {
//       // Get providers that support registration
//       const registrationProviders = this.providerRegistry.getRegistrationProviders();
      
//       if (registrationProviders.length === 0) {
//         return {
//           success: false,
//           error: {
//             code: 'REGISTRATION_NOT_SUPPORTED',
//             message: 'No authentication providers support registration'
//           }
//         };
//       }

//       // Use the specified provider or the first available registration provider
//       let provider = registrationProviders[0];
//       if (request.provider) {
//         const specifiedProvider = this.providerRegistry.getProvider(request.provider);
//         if (specifiedProvider && specifiedProvider.getCapabilities().supportsRegistration) {
//           provider = specifiedProvider;
//         }
//       }

//       // Validate registration data
//       const validation = await this.userValidator.validateRegistrationData({
//         email: request.email,
//         password: request.password,
//         firstName: request.firstName,
//         lastName: request.lastName,
//         role: request.role
//       });

//       if (!validation.isValid) {
//         return {
//           success: false,
//           error: {
//             code: 'VALIDATION_ERROR',
//             message: validation.errors.join(', ')
//           }
//         };
//       }

//       // Check if provider supports registration method
//       if ('register' in provider && typeof provider.register === 'function') {
//         const registrationResult = await (provider as any).register({
//           email: request.email,
//           password: request.password,
//           firstName: request.firstName,
//           lastName: request.lastName,
//           role: request.role
//         });

//         if (!registrationResult.success) {
//           return {
//             success: false,
//             error: {
//               code: registrationResult.error?.code || 'REGISTRATION_FAILED',
//               message: registrationResult.error?.message || 'Registration failed'
//             }
//           };
//         }

//         return {
//           success: true,
//           user: registrationResult.user!,
//           tokens: registrationResult.tokens!,
//           sessionId: registrationResult.tokens!.sessionId,
//           requiresEmailVerification: !registrationResult.user!.isEmailVerified
//         };
//       }

//       return {
//         success: false,
//         error: {
//           code: 'REGISTRATION_NOT_SUPPORTED',
//           message: 'Selected provider does not support registration'
//         }
//       };

//     } catch (error) {
//       console.error('Registration error:', error);
//       return {
//         success: false,
//         error: {
//           code: 'SERVER_ERROR',
//           message: 'Registration failed due to server error'
//         }
//       };
//     }
//   }

//   async resetPassword(request: PasswordResetRequest): Promise<{ success: boolean; message: string }> {
//     try {
//       if (request.token && request.newPassword) {
//         // Complete password reset with token
//         const providers = this.providerRegistry.getProvidersByCapability('supportsPasswordReset');
        
//         for (const provider of providers) {
//           if ('resetPassword' in provider && typeof provider.resetPassword === 'function') {
//             const result = await (provider as any).resetPassword(request.token, request.newPassword);
//             if (result.success) {
//               return result;
//             }
//           }
//         }

//         return {
//           success: false,
//           message: 'Invalid or expired password reset token'
//         };
//       } else if (request.email) {
//         // Initiate password reset
//         const providers = this.providerRegistry.getProvidersByCapability('supportsPasswordReset');
        
//         for (const provider of providers) {
//           if ('initiatePasswordReset' in provider && typeof provider.initiatePasswordReset === 'function') {
//             return await (provider as any).initiatePasswordReset(request.email);
//           }
//         }

//         return {
//           success: false,
//           message: 'Password reset is not supported'
//         };
//       }

//       return {
//         success: false,
//         message: 'Invalid password reset request'
//       };

//     } catch (error) {
//       console.error('Password reset error:', error);
//       return {
//         success: false,
//         message: 'Password reset failed due to server error'
//       };
//     }
//   }

//   async verifyEmail(request: EmailVerificationRequest): Promise<{ success: boolean; message: string }> {
//     try {
//       // Verify email verification token
//       const tokenPayload = await this.tokenService.verifyEmailVerificationToken(request.token);
      
//       if (!tokenPayload) {
//         return {
//           success: false,
//           message: 'Invalid or expired email verification token'
//         };
//       }

//       await connectToDatabase();

//       // Update user's email verification status
//       const user = await User.findById(tokenPayload.userId);
//       if (!user) {
//         return {
//           success: false,
//           message: 'User not found'
//         };
//       }

//       if (user.isEmailVerified) {
//         return {
//           success: true,
//           message: 'Email is already verified'
//         };
//       }

//       user.isEmailVerified = true;
//       user.emailVerifiedAt = new Date();
//       await user.save();

//       // Revoke the verification token
//       const tokenId = await this.tokenService.getTokenId(request.token);
//       if (tokenId) {
//         await this.tokenService.revokeToken(tokenId);
//       }

//       return {
//         success: true,
//         message: 'Email verified successfully'
//       };

//     } catch (error) {
//       console.error('Email verification error:', error);
//       return {
//         success: false,
//         message: 'Email verification failed due to server error'
//       };
//     }
//   }

//   async refreshToken(request: TokenRefreshRequest): Promise<AuthenticationResult> {
//     try {
//       // Verify and refresh the token
//       const newAccessToken = await this.tokenService.refreshAccessToken(request.refreshToken);
      
//       if (!newAccessToken) {
//         return {
//           success: false,
//           error: {
//             code: 'INVALID_REFRESH_TOKEN',
//             message: 'Invalid or expired refresh token'
//           }
//         };
//       }

//       // Verify the new access token to get user info
//       const tokenVerification = await this.tokenService.verifyToken(newAccessToken, 'access');
      
//       if (!tokenVerification.isValid || !tokenVerification.payload) {
//         return {
//           success: false,
//           error: {
//             code: 'TOKEN_VERIFICATION_FAILED',
//             message: 'Failed to verify new access token'
//           }
//         };
//       }

//       const payload = tokenVerification.payload as any;

//       // Get user details
//       await connectToDatabase();
//       const user = await User.findById(payload.userId);
      
//       if (!user) {
//         return {
//           success: false,
//           error: {
//             code: 'USER_NOT_FOUND',
//             message: 'User not found'
//           }
//         };
//       }

//       return {
//         success: true,
//         user: {
//           id: String(user._id),
//           email: user.email,
//           role: user.role,
//           isEmailVerified: user.isEmailVerified,
//           profile: user.profile || {}
//         },
//         tokens: {
//           accessToken: newAccessToken,
//           refreshToken: request.refreshToken, // Keep the same refresh token
//           sessionId: payload.sessionId
//         },
//         sessionId: payload.sessionId
//       };

//     } catch (error) {
//       console.error('Token refresh error:', error);
//       return {
//         success: false,
//         error: {
//           code: 'SERVER_ERROR',
//           message: 'Token refresh failed due to server error'
//         }
//       };
//     }
//   }

//   async logout(request: LogoutRequest): Promise<{ success: boolean; message: string }> {
//     try {
//       // Destroy the session
//       if (request.sessionId) {
//         const destroyResult = await this.sessionManager.destroySession(request.sessionId);
//         if (!destroyResult.success) {
//           console.warn('Failed to destroy session:', destroyResult.error);
//         }
//       }

//       // Revoke tokens if provided
//       if (request.accessToken) {
//         const tokenId = await this.tokenService.getTokenId(request.accessToken);
//         if (tokenId) {
//           await this.tokenService.revokeToken(tokenId);
//         }
//       }

//       if (request.refreshToken) {
//         const tokenId = await this.tokenService.getTokenId(request.refreshToken);
//         if (tokenId) {
//           await this.tokenService.revokeToken(tokenId);
//         }
//       }

//       // If logout all sessions is requested
//       if (request.logoutAllSessions && request.userId) {
//         await this.sessionManager.destroyAllUserSessions(request.userId);
//       }

//       return {
//         success: true,
//         message: 'Logged out successfully'
//       };

//     } catch (error) {
//       console.error('Logout error:', error);
//       return {
//         success: false,
//         message: 'Logout failed due to server error'
//       };
//     }
//   }

//   async getUserProfile(userId: string): Promise<UserProfileResult> {
//     try {
//       await connectToDatabase();

//       const user = await User.findById(userId).select('-password');
      
//       if (!user) {
//         return {
//           success: false,
//           error: {
//             code: 'USER_NOT_FOUND',
//             message: 'User not found'
//           }
//         };
//       }

//       return {
//         success: true,
//         user: {
//           id: String(user._id),
//           email: user.email,
//           role: user.role,
//           isEmailVerified: user.isEmailVerified,
//           profile: user.profile || {},
//           createdAt: user.createdAt,
//           lastLogin: user.lastLogin
//         }
//       };

//     } catch (error) {
//       console.error('Get user profile error:', error);
//       return {
//         success: false,
//         error: {
//           code: 'SERVER_ERROR',
//           message: 'Failed to retrieve user profile'
//         }
//       };
//     }
//   }

//   // Utility methods for service management
//   async validateConfiguration(): Promise<{ valid: boolean; errors: string[] }> {
//     const errors: string[] = [];

//     // Validate provider registry
//     if (!this.providerRegistry.hasAnyEnabledProviders()) {
//       errors.push('No enabled authentication providers found');
//     }

//     // Validate providers
//     const providerValidation = await this.providerRegistry.validateAllProviders();
//     errors.push(...providerValidation.invalid.map(name => `Invalid provider configuration: ${name}`));

//     // Validate container
//     const containerValidation = await this.container.validateContainer();
//     errors.push(...containerValidation.errors);

//     return {
//       valid: errors.length === 0,
//       errors
//     };
//   }

//   getServiceInfo(): {
//     providers: string[];
//     enabledProviders: string[];
//     defaultProvider: string | null;
//     capabilities: Record<string, number>;
//   } {
//     const stats = this.providerRegistry.getProviderStats();
    
//     return {
//       providers: this.providerRegistry.getProviderNames(),
//       enabledProviders: this.providerRegistry.getEnabledProviderNames(),
//       defaultProvider: this.providerRegistry.getDefaultProviderName(),
//       capabilities: stats.byCapability
//     };
//   }
// }