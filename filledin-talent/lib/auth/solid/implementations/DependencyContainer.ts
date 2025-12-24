// import { 
//   IDependencyContainer,
//   IServiceLocator,
//   ServiceToken,
//   Constructor,
//   Factory,
//   RegistrationOptions,
//   ServiceLifetime
// } from '../interfaces/IDependencyContainer';

// /**
//  * Dependency Inversion Container implementation
//  * Manages service dependencies following Dependency Inversion Principle
//  */
// export class DependencyContainer implements IDependencyContainer, IServiceLocator {
//   private services = new Map<string, ServiceRegistration>();
//   private instances = new Map<string, any>();
//   private resolutionStack = new Set<string>();

//   async register<T>(
//     token: ServiceToken<T>,
//     implementation: Constructor<T> | Factory<T>,
//     options?: RegistrationOptions
//   ): Promise<void> {
//     const key = this.getTokenKey(token);
    
//     if (this.services.has(key)) {
//       if (!options?.allowOverride) {
//         throw new Error(`Service '${key}' is already registered. Use allowOverride option to replace.`);
//       }
//     }

//     const registration: ServiceRegistration = {
//       token,
//       implementation,
//       lifetime: options?.lifetime || ServiceLifetime.TRANSIENT,
//       dependencies: options?.dependencies || [],
//       metadata: options?.metadata || {}
//     };

//     this.services.set(key, registration);

//     // Clear any existing singleton instance if overriding
//     if (options?.allowOverride && this.instances.has(key)) {
//       this.instances.delete(key);
//     }

//     console.log(`Service '${key}' registered with lifetime: ${registration.lifetime}`);
//   }

//   async registerSingleton<T>(
//     token: ServiceToken<T>,
//     implementation: Constructor<T> | Factory<T>,
//     options?: Omit<RegistrationOptions, 'lifetime'>
//   ): Promise<void> {
//     await this.register(token, implementation, {
//       ...options,
//       lifetime: ServiceLifetime.SINGLETON
//     });
//   }

//   async registerScoped<T>(
//     token: ServiceToken<T>,
//     implementation: Constructor<T> | Factory<T>,
//     options?: Omit<RegistrationOptions, 'lifetime'>
//   ): Promise<void> {
//     await this.register(token, implementation, {
//       ...options,
//       lifetime: ServiceLifetime.SCOPED
//     });
//   }

//   async registerTransient<T>(
//     token: ServiceToken<T>,
//     implementation: Constructor<T> | Factory<T>,
//     options?: Omit<RegistrationOptions, 'lifetime'>
//   ): Promise<void> {
//     await this.register(token, implementation, {
//       ...options,
//       lifetime: ServiceLifetime.TRANSIENT
//     });
//   }

//   async registerInstance<T>(token: ServiceToken<T>, instance: T): Promise<void> {
//     const key = this.getTokenKey(token);
    
//     // Create a factory that returns the instance
//     const factory: Factory<T> = () => Promise.resolve(instance);
    
//     await this.register(token, factory, {
//       lifetime: ServiceLifetime.SINGLETON,
//       allowOverride: true
//     });

//     // Store the instance directly
//     this.instances.set(key, instance);
//   }

//   async resolve<T>(token: ServiceToken<T>): Promise<T> {
//     const key = this.getTokenKey(token);
    
//     // Check for circular dependencies
//     if (this.resolutionStack.has(key)) {
//       const stack = Array.from(this.resolutionStack).join(' -> ');
//       throw new Error(`Circular dependency detected: ${stack} -> ${key}`);
//     }

//     try {
//       this.resolutionStack.add(key);
//       return await this.resolveInternal<T>(token);
//     } finally {
//       this.resolutionStack.delete(key);
//     }
//   }

//   async resolveOptional<T>(token: ServiceToken<T>): Promise<T | null> {
//     try {
//       return await this.resolve(token);
//     } catch (error) {
//       if (error instanceof Error && error.message.includes('not registered')) {
//         return null;
//       }
//       throw error;
//     }
//   }

//   async resolveAll<T>(token: ServiceToken<T>): Promise<T[]> {
//     const key = this.getTokenKey(token);
//     const registrations = Array.from(this.services.values()).filter(
//       reg => this.getTokenKey(reg.token) === key
//     );

//     const instances: T[] = [];
//     for (const registration of registrations) {
//       const instance = await this.createInstance<T>(registration);
//       instances.push(instance);
//     }

//     return instances;
//   }

//   isRegistered<T>(token: ServiceToken<T>): boolean {
//     const key = this.getTokenKey(token);
//     return this.services.has(key);
//   }

//   async unregister<T>(token: ServiceToken<T>): Promise<void> {
//     const key = this.getTokenKey(token);
    
//     if (!this.services.has(key)) {
//       throw new Error(`Service '${key}' is not registered`);
//     }

//     this.services.delete(key);
//     this.instances.delete(key);
    
//     console.log(`Service '${key}' unregistered`);
//   }

//   clear(): void {
//     this.services.clear();
//     this.instances.clear();
//     this.resolutionStack.clear();
//     console.log('All services cleared from container');
//   }

//   getRegisteredServices(): string[] {
//     return Array.from(this.services.keys());
//   }

//   getServiceInfo<T>(token: ServiceToken<T>): ServiceRegistration | null {
//     const key = this.getTokenKey(token);
//     return this.services.get(key) || null;
//   }

//   // Create a child container for scoped services
//   createScope(): IDependencyContainer {
//     const scopedContainer = new DependencyContainer();
    
//     // Copy all registrations to the scoped container
//     for (const [key, registration] of this.services) {
//       scopedContainer.services.set(key, { ...registration });
//     }

//     // Copy singleton instances to the scoped container
//     for (const [key, instance] of this.instances) {
//       const registration = this.services.get(key);
//       if (registration?.lifetime === ServiceLifetime.SINGLETON) {
//         scopedContainer.instances.set(key, instance);
//       }
//     }

//     return scopedContainer;
//   }

//   // Validate container configuration
//   async validateContainer(): Promise<{ valid: boolean; errors: string[] }> {
//     const errors: string[] = [];

//     for (const [key, registration] of this.services) {
//       try {
//         // Try to resolve each service to check for issues
//         await this.resolve(registration.token);
//       } catch (error) {
//         if (error instanceof Error) {
//           errors.push(`Service '${key}': ${error.message}`);
//         }
//       }
//     }

//     return {
//       valid: errors.length === 0,
//       errors
//     };
//   }

//   private async resolveInternal<T>(token: ServiceToken<T>): Promise<T> {
//     const key = this.getTokenKey(token);
//     const registration = this.services.get(key);

//     if (!registration) {
//       throw new Error(`Service '${key}' is not registered`);
//     }

//     // Check for existing singleton instance
//     if (registration.lifetime === ServiceLifetime.SINGLETON && this.instances.has(key)) {
//       return this.instances.get(key);
//     }

//     // Create new instance
//     const instance = await this.createInstance<T>(registration);

//     // Store singleton instances
//     if (registration.lifetime === ServiceLifetime.SINGLETON) {
//       this.instances.set(key, instance);
//     }

//     return instance;
//   }

//   private async createInstance<T>(registration: ServiceRegistration): Promise<T> {
//     const { implementation, dependencies } = registration;

//     // Resolve dependencies
//     const resolvedDependencies: any[] = [];
//     for (const dependency of dependencies) {
//       const resolvedDep = await this.resolve(dependency);
//       resolvedDependencies.push(resolvedDep);
//     }

//     // Create instance
//     if (this.isConstructor(implementation)) {
//       return new implementation(...resolvedDependencies);
//     } else {
//       // It's a factory function
//       return await implementation(...resolvedDependencies);
//     }
//   }

//   private isConstructor<T>(implementation: Constructor<T> | Factory<T>): implementation is Constructor<T> {
//     // Check if it's a constructor function
//     return implementation.prototype !== undefined;
//   }

//   private getTokenKey<T>(token: ServiceToken<T>): string {
//     if (typeof token === 'string') {
//       return token;
//     } else if (typeof token === 'symbol') {
//       return token.toString();
//     } else {
//       // It's a constructor function
//       return token.name || 'anonymous';
//     }
//   }
// }

// interface ServiceRegistration {
//   token: ServiceToken<any>;
//   implementation: Constructor<any> | Factory<any>;
//   lifetime: ServiceLifetime;
//   dependencies: ServiceToken<any>[];
//   metadata: Record<string, any>;
// }

// // Service locator implementation for legacy code
// export class ServiceLocator implements IServiceLocator {
//   private static container: IDependencyContainer;

//   static setContainer(container: IDependencyContainer): void {
//     ServiceLocator.container = container;
//   }

//   static async resolve<T>(token: ServiceToken<T>): Promise<T> {
//     if (!ServiceLocator.container) {
//       throw new Error('Service locator container is not initialized');
//     }
//     return ServiceLocator.container.resolve(token);
//   }

//   static async resolveOptional<T>(token: ServiceToken<T>): Promise<T | null> {
//     if (!ServiceLocator.container) {
//       return null;
//     }
//     return ServiceLocator.container.resolveOptional(token);
//   }

//   static isRegistered<T>(token: ServiceToken<T>): boolean {
//     if (!ServiceLocator.container) {
//       return false;
//     }
//     return ServiceLocator.container.isRegistered(token);
//   }

//   async resolve<T>(token: ServiceToken<T>): Promise<T> {
//     return ServiceLocator.resolve(token);
//   }

//   async resolveOptional<T>(token: ServiceToken<T>): Promise<T | null> {
//     return ServiceLocator.resolveOptional(token);
//   }

//   isRegistered<T>(token: ServiceToken<T>): boolean {
//     return ServiceLocator.isRegistered(token);
//   }
// }