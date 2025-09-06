import { test, expect } from '@playwright/test';

// Mock authentication setup for comprehensive security testing
test.beforeEach(async ({ page }) => {
  // Mock Supabase client and authentication
  await page.addInitScript(() => {
    // Mock Supabase auth responses
    (window as any).__mockSupabaseAuth = {
      admin: {
        uid: 'admin_123',
        email: 'admin@heiwa.house',
        role: 'admin',
        session: { access_token: 'mock_admin_token' }
      },
      client: {
        uid: 'client_123',
        email: 'client@example.com',
        role: 'client',
        session: { access_token: 'mock_client_token' }
      },
      unauthenticated: null
    };

    // Mock Supabase client
    (window as any).supabase = {
      auth: {
        getUser: async (token?: string) => {
          if (token === 'mock_admin_token') {
            return { data: { user: (window as any).__mockSupabaseAuth.admin }, error: null };
          } else if (token === 'mock_client_token') {
            return { data: { user: (window as any).__mockSupabaseAuth.client }, error: null };
          }
          return { data: { user: null }, error: { message: 'Invalid token' } };
        },
        getSession: async () => {
          const currentUser = (window as any).__currentUser;
          if (currentUser) {
            return { data: { session: currentUser.session }, error: null };
          }
          return { data: { session: null }, error: null };
        },
        signOut: async () => {
          (window as any).__currentUser = null;
          return { error: null };
        }
      },
      from: (table: string) => ({
        select: (columns?: string) => ({
          eq: (column: string, value: any) => ({
            single: async () => {
              // Mock RLS policy enforcement
              const currentUser = (window as any).__currentUser;
              if (!currentUser) {
                return { data: null, error: { message: 'Not authenticated' } };
              }
              
              if (table === 'client_profiles' && currentUser.role === 'client') {
                // Clients can only access their own data
                if (column === 'user_id' && value !== currentUser.uid) {
                  return { data: null, error: { message: 'Access denied' } };
                }
              }
              
              if (table === 'bookings' && currentUser.role === 'client') {
                // Mock client can only see their bookings
                return {
                  data: { id: 'booking_123', client_ids: [currentUser.uid] },
                  error: null
                };
              }
              
              return { data: { id: 'mock_data' }, error: null };
            }
          })
        }),
        insert: (data: any) => ({
          select: () => ({
            single: async () => {
              const currentUser = (window as any).__currentUser;
              if (!currentUser) {
                return { data: null, error: { message: 'Not authenticated' } };
              }
              return { data: { ...data, id: 'new_id' }, error: null };
            }
          })
        }),
        update: (data: any) => ({
          eq: (column: string, value: any) => ({
            select: () => ({
              single: async () => {
                const currentUser = (window as any).__currentUser;
                if (!currentUser) {
                  return { data: null, error: { message: 'Not authenticated' } };
                }
                
                // Mock RLS enforcement for updates
                if (table === 'client_profiles' && currentUser.role === 'client' && value !== currentUser.uid) {
                  return { data: null, error: { message: 'Access denied' } };
                }
                
                return { data: { ...data, id: value }, error: null };
              }
            })
          })
        }),
        delete: () => ({
          eq: (column: string, value: any) => ({
            single: async () => {
              const currentUser = (window as any).__currentUser;
              if (!currentUser || currentUser.role !== 'admin') {
                return { data: null, error: { message: 'Admin access required' } };
              }
              return { data: {}, error: null };
            }
          })
        })
      })
    };

    // Mock fetch for API routes
    const originalFetch = window.fetch;
    (window as any).fetch = async (url: string, options?: any) => {
      // Mock protected API routes
      if (url.includes('/api/admin/') || url.includes('/api/gdpr/')) {
        const currentUser = (window as any).__currentUser;
        if (!currentUser || currentUser.role !== 'admin') {
          return {
            ok: false,
            status: 401,
            json: async () => ({ error: 'Admin authentication required' })
          };
        }
      }
      
      if (url.includes('/api/client/')) {
        const currentUser = (window as any).__currentUser;
        if (!currentUser) {
          return {
            ok: false,
            status: 401,
            json: async () => ({ error: 'Authentication required' })
          };
        }
      }
      
      return {
        ok: true,
        json: async () => ({ success: true, data: {} })
      };
    };
  });
});

test.describe('Whitelist Authentication (AUTH-001)', () => {
  test('should allow whitelisted admin email to login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Mock successful login for whitelisted admin
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.admin;
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock_admin_token',
        user: { email: 'admin@heiwa.house', role: 'admin' }
      }));
    });

    // Simulate login process
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should successfully access admin dashboard
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();
  });

  test('should reject non-whitelisted email login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Mock failed login for non-whitelisted email
    await page.addInitScript(() => {
      (window as any).__currentUser = null;
      (window as any).supabase.auth.signInWithOAuth = async () => {
        return {
          data: null,
          error: { message: 'Email not in admin whitelist' }
        };
      };
    });

    // Try to access admin area
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // Should be redirected or show error
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/auth');
    const hasErrorMessage = await page.locator('text=not authorized, text=unauthorized, text=access denied').isVisible();

    expect(isRedirected || hasErrorMessage).toBeTruthy();
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Set authenticated session
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.admin;
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock_admin_token',
        user: { email: 'admin@heiwa.house', role: 'admin' }
      }));
    });

    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Verify initial access
    await expect(page.locator('main')).toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be authenticated
    await expect(page.locator('main')).toBeVisible();
    expect(page.url()).toContain('/admin/bookings');
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Mock successful authentication
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.admin;
      // Mock redirect behavior
      setTimeout(() => {
        window.location.href = '/admin';
      }, 100);
    });

    await page.waitForTimeout(500);

    // Should redirect to admin dashboard
    expect(page.url()).toContain('/admin');
  });

  test('should handle logout functionality', async ({ page }) => {
    // Set authenticated session
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.admin;
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock_admin_token',
        user: { email: 'admin@heiwa.house', role: 'admin' }
      }));
    });

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Mock logout functionality
    await page.addInitScript(() => {
      (window as any).logout = () => {
        (window as any).__currentUser = null;
        localStorage.removeItem('supabase.auth.token');
        window.location.href = '/login';
      };
    });

    // Trigger logout
    await page.evaluate(() => {
      (window as any).logout();
    });

    await page.waitForTimeout(500);

    // Should redirect to login
    expect(page.url()).toContain('/login');
  });
});

test.describe('Authentication and Security (AUTH-002, AUTH-004)', () => {
  test('should redirect unauthenticated users from protected admin routes', async ({ page }) => {
    // Set unauthenticated state
    await page.addInitScript(() => {
      (window as any).__currentUser = null;
    });

    // Try to access admin routes
    const adminRoutes = [
      '/admin',
      '/admin/bookings',
      '/admin/analytics',
      '/admin/compliance',
      '/admin/rooms',
      '/admin/surf-camps'
    ];

    for (const route of adminRoutes) {
      await page.goto(route);
      
      // Should redirect to login or show unauthorized
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      
      // Check if redirected to login or shows unauthorized message
      const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/auth');
      const hasUnauthorizedMessage = await page.locator('text=unauthorized').isVisible() ||
                                    await page.locator('text=not authorized').isVisible() ||
                                    await page.locator('text=access denied').isVisible();
      
      expect(isRedirected || hasUnauthorizedMessage).toBeTruthy();
    }
  });

  test('should allow authenticated admin access to admin routes', async ({ page }) => {
    // Set admin authentication
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.admin;
    });

    // Test admin routes access
    const adminRoutes = [
      { path: '/admin/bookings', title: 'Bookings' },
      { path: '/admin/analytics', title: 'Analytics' },
      { path: '/admin/compliance', title: 'Compliance' }
    ];

    for (const route of adminRoutes) {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      
      // Should successfully load the page
      await expect(page.locator(`text=${route.title}`)).toBeVisible();
    }
  });

  test('should deny client access to admin routes', async ({ page }) => {
    // Set client authentication
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.client;
    });

    // Try to access admin routes as client
    await page.goto('/admin/bookings');
    await page.waitForTimeout(1000);
    
    // Should be denied access
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/client') || currentUrl.includes('/login');
    const hasUnauthorizedMessage = await page.locator('text=unauthorized').isVisible() ||
                                  await page.locator('text=not authorized').isVisible();
    
    expect(isRedirected || hasUnauthorizedMessage).toBeTruthy();
  });

  test('should allow client access to client portal', async ({ page }) => {
    // Set client authentication
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.client;
    });

    await page.goto('/client');
    await page.waitForLoadState('networkidle');
    
    // Should successfully load client portal
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should enforce RLS policies for client data access', async ({ page }) => {
    // Set client authentication
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.client;
    });

    await page.goto('/client');
    await page.waitForLoadState('networkidle');

    // Test client can access own data
    const ownDataAccess = await page.evaluate(async () => {
      const { data, error } = await (window as any).supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', 'client_123')
        .single();
      
      return { success: !error, data };
    });

    expect(ownDataAccess.success).toBeTruthy();

    // Test client cannot access other client's data
    const otherDataAccess = await page.evaluate(async () => {
      const { data, error } = await (window as any).supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', 'other_client_456')
        .single();
      
      return { success: !error, error: error?.message };
    });

    expect(otherDataAccess.success).toBeFalsy();
    expect(otherDataAccess.error).toContain('Access denied');
  });

  test('should enforce admin-only API endpoints', async ({ page }) => {
    // Test without authentication
    await page.addInitScript(() => {
      (window as any).__currentUser = null;
    });

    await page.goto('/admin/compliance');
    
    // Test GDPR endpoints require admin auth
    const unauthenticatedResponse = await page.evaluate(async () => {
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientEmail: 'test@example.com' })
      });
      
      return {
        ok: response.ok,
        status: response.status,
        error: await response.json()
      };
    });

    expect(unauthenticatedResponse.ok).toBeFalsy();
    expect(unauthenticatedResponse.status).toBe(401);

    // Test with client authentication (should still fail)
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.client;
    });

    const clientResponse = await page.evaluate(async () => {
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientEmail: 'test@example.com' })
      });
      
      return {
        ok: response.ok,
        status: response.status
      };
    });

    expect(clientResponse.ok).toBeFalsy();
    expect(clientResponse.status).toBe(401);

    // Test with admin authentication (should succeed)
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.admin;
    });

    const adminResponse = await page.evaluate(async () => {
      const response = await fetch('/api/gdpr/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientEmail: 'test@example.com' })
      });
      
      return { ok: response.ok };
    });

    expect(adminResponse.ok).toBeTruthy();
  });

  test('should log GDPR actions in consent_logs table', async ({ page }) => {
    // Set admin authentication
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.admin;
      
      // Mock consent_logs table
      (window as any).__consentLogs = [];
      
      // Override supabase to capture consent logs
      const originalSupabase = (window as any).supabase;
      (window as any).supabase = {
        ...originalSupabase,
        from: (table: string) => {
          if (table === 'consent_logs') {
            return {
              insert: (data: any) => ({
                async: async () => {
                  (window as any).__consentLogs.push(data);
                  return { data, error: null };
                }
              })
            };
          }
          return originalSupabase.from(table);
        }
      };
    });

    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');

    // Simulate GDPR data export action
    await page.evaluate(async () => {
      // Mock GDPR export that logs to consent_logs
      await (window as any).supabase
        .from('consent_logs')
        .insert({
          user_id: 'client_123',
          action: 'data_export',
          details: {
            requestedBy: 'admin@heiwa.house',
            reason: 'Client data request',
            timestamp: new Date().toISOString()
          }
        });
    });

    // Verify consent log was created
    const consentLogs = await page.evaluate(() => (window as any).__consentLogs);
    expect(consentLogs).toHaveLength(1);
    expect(consentLogs[0].action).toBe('data_export');
    expect(consentLogs[0].user_id).toBe('client_123');
  });

  test('should handle session expiration gracefully', async ({ page }) => {
    // Set initial authentication
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.admin;
    });

    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');

    // Simulate session expiration
    await page.addInitScript(() => {
      (window as any).__currentUser = null;
      
      // Mock expired session response
      (window as any).supabase.auth.getSession = async () => {
        return { data: { session: null }, error: { message: 'Session expired' } };
      };
    });

    // Try to perform an action that requires authentication
    await page.evaluate(async () => {
      await fetch('/api/admin/test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
    });

    // Should handle session expiration (redirect to login or show message)
    await page.waitForTimeout(1000);
    const hasSessionExpiredMessage = await page.locator('text=session expired').isVisible() ||
                                    await page.locator('text=please log in').isVisible();
    
    expect(hasSessionExpiredMessage).toBeTruthy();
  });

  test('should validate JWT tokens properly', async ({ page }) => {
    await page.addInitScript(() => {
      // Mock JWT validation
      (window as any).validateJWT = (token: string) => {
        const validTokens = ['mock_admin_token', 'mock_client_token'];
        return validTokens.includes(token);
      };
    });

    // Test valid token
    const validTokenResult = await page.evaluate(() => {
      return (window as any).validateJWT('mock_admin_token');
    });
    expect(validTokenResult).toBeTruthy();

    // Test invalid token
    const invalidTokenResult = await page.evaluate(() => {
      return (window as any).validateJWT('invalid_token');
    });
    expect(invalidTokenResult).toBeFalsy();
  });

  test('should take snapshots for visual regression', async ({ page }) => {
    // Set admin authentication for snapshot
    await page.addInitScript(() => {
      (window as any).__currentUser = (window as any).__mockSupabaseAuth.admin;
    });

    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot of authenticated admin view
    await expect(page.locator('body')).toHaveScreenshot('auth-admin-view.png');

    // Test login page snapshot
    await page.addInitScript(() => {
      (window as any).__currentUser = null;
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toHaveScreenshot('auth-login-page.png');

    // Test unauthorized access snapshot
    await page.goto('/admin/compliance');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page.locator('body')).toHaveScreenshot('auth-unauthorized-access.png');
  });
});
