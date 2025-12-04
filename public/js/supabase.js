// Supabase Client Configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://biivddyxbvmqgtkepvlw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpaXZkZHl4YnZtcWd0a2Vwdmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNzY1MjAsImV4cCI6MjA3OTg1MjUyMH0.KmGQBobFz_beflanAVRh9Ezzv4cKNtF7nbrbNzDBNqA';

// Initialize Supabase client (loaded via CDN in HTML)
let supabase = null;

async function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Handle OAuth redirect - check for tokens in URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const hasAuthTokens = hashParams.has('access_token') || hashParams.has('refresh_token');

        if (hasAuthTokens) {
            // Wait for Supabase to process the OAuth callback
            // The SDK automatically detects and processes hash tokens
            try {
                // Give SDK a moment to process the tokens
                await new Promise(resolve => setTimeout(resolve, 100));

                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Error getting session from OAuth redirect:', error);
                } else if (data.session) {
                    console.log('OAuth session established successfully');
                    // Clean up the URL hash after successful auth
                    if (window.history.replaceState) {
                        window.history.replaceState(null, '', window.location.pathname + window.location.search);
                    }
                }
            } catch (e) {
                console.error('OAuth session check error:', e);
            }
        } else {
            // Normal session check (no OAuth redirect)
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Error getting session:', error);
                }
            } catch (e) {
                console.error('Session check error:', e);
            }
        }

        return true;
    }
    console.error('Supabase SDK not loaded');
    return false;
}

// Helper function to get current month string
function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Ensure user has a profile with free plan initialized
async function ensureProfile(userId, email, fullName) {
    if (!supabase || !userId) return null;

    try {
        // First try to get the profile - use maybeSingle() to handle 0 or 1 row
        const { data: existingProfile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        console.log('ensureProfile - existing profile:', existingProfile, 'error:', error);

        // Profile exists, ensure it has proper usage fields
        if (existingProfile) {
            const currentMonth = getCurrentMonth();
            let needsUpdate = false;
            const updates = {};

            // Check if usage fields are initialized
            if (existingProfile.designs_this_month === null || existingProfile.designs_this_month === undefined) {
                updates.designs_this_month = 0;
                existingProfile.designs_this_month = 0;
                needsUpdate = true;
            }

            if (existingProfile.usage_month === null || existingProfile.usage_month === undefined) {
                updates.usage_month = currentMonth;
                existingProfile.usage_month = currentMonth;
                needsUpdate = true;
            }

            // Ensure subscription_plan is set (default to 'free' if null)
            if (!existingProfile.subscription_plan) {
                updates.subscription_plan = 'free';
                existingProfile.subscription_plan = 'free';
                needsUpdate = true;
            }

            if (needsUpdate) {
                console.log('ensureProfile - updating profile with:', updates);
                await supabase.from('profiles').update(updates).eq('id', userId);
            }

            return existingProfile;
        }

        // Profile doesn't exist, create it with free plan using INSERT (not upsert)
        const currentMonth = getCurrentMonth();
        console.log('ensureProfile - creating new profile for user:', userId);

        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email: email || '',
                full_name: fullName || '',
                subscription_plan: 'free',
                subscription_status: null,
                designs_this_month: 0,
                usage_month: currentMonth
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating profile:', insertError);

            // If insert failed due to conflict, try to fetch the existing profile again
            if (insertError.code === '23505') { // Unique violation
                const { data: retryProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle();
                return retryProfile;
            }

            // Return a default profile object so the app doesn't break
            return {
                id: userId,
                subscription_plan: 'free',
                subscription_status: null,
                designs_this_month: 0,
                usage_month: currentMonth
            };
        }

        console.log('ensureProfile - created new profile:', newProfile);
        return newProfile;
    } catch (err) {
        console.error('ensureProfile - unexpected error:', err);
        // Return default profile to prevent paywall
        return {
            id: userId,
            subscription_plan: 'free',
            subscription_status: null,
            designs_this_month: 0,
            usage_month: getCurrentMonth()
        };
    }
}

// Auth Helper Functions
async function signUpWithEmail(email, password, fullName) {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            },
            emailRedirectTo: window.location.origin + '/design.html'
        }
    });

    // Profile creation is now handled automatically by onAuthStateChange
    // which calls /api/ensure-profile on SIGNED_IN event
    // This ensures profiles are created server-side with proper INSERT logic
    // and avoids the upsert issue that was resetting user data

    return { data, error };
}

async function signInWithEmail(email, password) {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    return { data, error };
}

async function signInWithGoogle() {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    // Redirect back to current page after Google OAuth
    const currentPage = window.location.href.split('#')[0].split('?')[0];

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: currentPage
        }
    });

    return { data, error };
}

async function signOut() {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { error } = await supabase.auth.signOut();
    return { error };
}

async function getUser() {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

async function getSession() {
    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

async function resetPassword(email) {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password.html'
    });

    return { data, error };
}

// Profile Functions
async function getProfile(userId) {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    return { data, error };
}

async function updateProfile(userId, updates) {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

    return { data, error };
}

// Upload image to Supabase Storage via server API
async function uploadImage(imageData, imageType) {
    try {
        const session = await getSession();
        if (!session) {
            return { error: { message: 'Not authenticated' } };
        }

        const response = await fetch('/api/upload-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ imageData, imageType })
        });

        const data = await response.json();
        if (!response.ok) {
            return { error: { message: data.error || 'Upload failed' } };
        }

        return { data: { url: data.url }, error: null };
    } catch (error) {
        console.error('Upload error:', error);
        return { error: { message: error.message } };
    }
}

// Design Functions
async function saveDesign(userId, designData) {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    console.log('saveDesign - saving for user:', userId);
    console.log('saveDesign - designData:', {
        roomType: designData.roomType,
        color: designData.color,
        originalImageUrl: designData.originalImageUrl?.substring(0, 50) + '...',
        generatedImageUrl: designData.generatedImageUrl?.substring(0, 50) + '...',
        furnitureDataLength: designData.furnitureData?.length
    });

    try {
        const { data, error } = await supabase
            .from('designs')
            .insert({
                user_id: userId,
                room_type: designData.roomType,
                color: designData.color,
                original_image_url: designData.originalImageUrl,
                generated_image_url: designData.generatedImageUrl,
                furniture_data: designData.furnitureData
            })
            .select()
            .single();

        if (error) {
            console.error('saveDesign - Supabase error:', error);
        } else {
            console.log('saveDesign - success:', data);
        }

        return { data, error };
    } catch (err) {
        console.error('saveDesign - exception:', err);
        return { error: { message: err.message } };
    }
}

async function getUserDesigns(userId) {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    return { data, error };
}

async function deleteDesign(designId) {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', designId);

    return { error };
}

// Order Functions
async function createOrder(userId, orderData) {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { data, error } = await supabase
        .from('orders')
        .insert({
            user_id: userId,
            paypal_order_id: orderData.paypalOrderId,
            amount: orderData.amount,
            currency: orderData.currency || 'USD',
            status: orderData.status || 'pending',
            design_id: orderData.designId
        })
        .select()
        .single();

    return { data, error };
}

async function updateOrderStatus(orderId, status) {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();

    return { data, error };
}

async function getUserOrders(userId) {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    return { data, error };
}

// Helper function to ensure profile exists via server API
async function ensureProfileViaServer(session) {
    if (!session || !session.access_token) return;

    try {
        console.log(`🔑 Ensuring profile exists via server...`);
        const response = await fetch('/api/ensure-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.created) {
                console.log('✅ New profile created on sign in');
            } else {
                console.log('✅ Existing profile found, no changes made');
            }
            return data;
        } else {
            console.error('Failed to ensure profile:', response.status);
        }
    } catch (err) {
        console.error('Error ensuring profile on auth:', err);
    }
    return null;
}

// Auth state change listener - also ensures profile exists on sign in
function onAuthStateChange(callback) {
    if (!supabase) return null;

    return supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`🔑 Auth event: ${event}`);

        // On sign in (both email and Google OAuth), ensure profile exists via server
        // Also handle INITIAL_SESSION for page loads where user is already logged in
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') && session) {
            await ensureProfileViaServer(session);
        }

        callback(event, session);
    });
}

// Usage Tracking Functions
const FREE_DESIGNS_PER_MONTH = 5;

async function getMonthlyUsage(userId) {
    // First try to get from profile in Supabase
    if (supabase && userId) {
        const { data: profile } = await getProfile(userId);
        if (profile) {
            const currentMonth = getCurrentMonth();
            // Check if usage_month matches current month
            if (profile.usage_month === currentMonth) {
                return profile.designs_this_month || 0;
            } else {
                // New month, reset counter
                await updateProfile(userId, {
                    designs_this_month: 0,
                    usage_month: currentMonth
                });
                return 0;
            }
        }
    }

    // Fallback to localStorage for non-logged in users
    const usageData = JSON.parse(localStorage.getItem('dikoora_usage') || '{}');
    const currentMonth = getCurrentMonth();

    if (usageData.month !== currentMonth) {
        // Reset for new month
        usageData.month = currentMonth;
        usageData.count = 0;
        localStorage.setItem('dikoora_usage', JSON.stringify(usageData));
    }

    return usageData.count || 0;
}

async function incrementUsage(userId) {
    const currentMonth = getCurrentMonth();

    // Always update localStorage as backup
    const usageData = JSON.parse(localStorage.getItem('dikoora_usage') || '{}');
    if (usageData.month !== currentMonth) {
        usageData.month = currentMonth;
        usageData.count = 0;
    }
    usageData.count = (usageData.count || 0) + 1;
    localStorage.setItem('dikoora_usage', JSON.stringify(usageData));
    console.log('incrementUsage - localStorage count:', usageData.count);

    // Use server API to increment usage (bypasses RLS)
    if (supabase && userId) {
        try {
            const session = await getSession();
            if (session) {
                const response = await fetch('/api/increment-usage', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('incrementUsage - server response:', data);
                    // Sync localStorage with server count
                    usageData.count = data.count;
                    localStorage.setItem('dikoora_usage', JSON.stringify(usageData));
                    return data.count;
                } else {
                    console.error('incrementUsage - server error:', response.status);
                }
            }
        } catch (err) {
            console.error('incrementUsage - error calling server:', err);
        }
    }

    return usageData.count;
}

// Admin accounts with unlimited access
const ADMIN_EMAILS = ['ymassour@gmail.com'];

async function canGenerateDesign(userId) {
    const currentMonth = getCurrentMonth();

    // Get localStorage count for display purposes only
    const usageData = JSON.parse(localStorage.getItem('dikoora_usage') || '{}');
    let localStorageCount = 0;
    if (usageData.month === currentMonth) {
        localStorageCount = usageData.count || 0;
    }
    console.log('canGenerateDesign - localStorage count:', localStorageCount);

    // Require userId - anonymous users should not reach this point
    if (!userId) {
        console.error('canGenerateDesign - no userId provided, user must be logged in');
        return {
            allowed: false,
            remaining: 0,
            used: 0,
            limit: FREE_DESIGNS_PER_MONTH,
            isPro: false,
            error: 'Login required'
        };
    }

    // Use server API to check usage (bypasses RLS, most accurate)
    if (supabase) {
        try {
            const session = await getSession();
            if (session) {
                const response = await fetch('/api/check-usage', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('canGenerateDesign - server response:', data);

                    // Sync localStorage with server count
                    if (!data.isPro && !data.isAdmin) {
                        usageData.count = data.used;
                        usageData.month = currentMonth;
                        localStorage.setItem('dikoora_usage', JSON.stringify(usageData));
                    }

                    return {
                        allowed: data.allowed,
                        remaining: data.remaining,
                        used: data.used || 0,
                        limit: data.limit || FREE_DESIGNS_PER_MONTH,
                        isPro: data.isPro || false,
                        isAdmin: data.isAdmin || false
                    };
                } else {
                    console.error('canGenerateDesign - server error:', response.status);
                    // Server error - don't allow generation to prevent bypass
                    return {
                        allowed: false,
                        remaining: 0,
                        used: localStorageCount,
                        limit: FREE_DESIGNS_PER_MONTH,
                        isPro: false,
                        error: 'Unable to verify usage. Please try again.'
                    };
                }
            } else {
                console.error('canGenerateDesign - no session, user needs to re-login');
                return {
                    allowed: false,
                    remaining: 0,
                    used: 0,
                    limit: FREE_DESIGNS_PER_MONTH,
                    isPro: false,
                    error: 'Session expired. Please log in again.'
                };
            }
        } catch (err) {
            console.error('canGenerateDesign - error calling server:', err);
            // Network error - don't allow generation to prevent bypass
            return {
                allowed: false,
                remaining: 0,
                used: localStorageCount,
                limit: FREE_DESIGNS_PER_MONTH,
                isPro: false,
                error: 'Network error. Please check your connection.'
            };
        }
    }

    // Supabase not initialized - block generation
    console.error('canGenerateDesign - supabase not initialized');
    return {
        allowed: false,
        remaining: 0,
        used: 0,
        limit: FREE_DESIGNS_PER_MONTH,
        isPro: false,
        error: 'Service unavailable'
    };
}

// Storage Functions (for uploading images)
async function uploadDesignImage(userId, file, fileName) {
    if (!supabase) return { error: { message: 'Supabase not initialized' } };

    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
        .from('design-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) return { data: null, error };

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('design-images')
        .getPublicUrl(filePath);

    return { data: { path: data.path, publicUrl }, error: null };
}
