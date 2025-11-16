import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    collection, 
    query, 
    onSnapshot, 
    setDoc,
    serverTimestamp,
    getDoc
} from 'firebase/firestore';

// --- CANVAS ENVIRONMENT GLOBALS ---
// In a real Vercel/Vite app, you would load these from process.env or import.meta.env
const CANVAS_APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const CANVAS_FIREBASE_CONFIG = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const CANVAS_AUTH_TOKEN = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const DATA_COLLECTION = "dashboard_data";

// --- FIREBASE INITIALIZATION ---
let db, auth;
if (CANVAS_FIREBASE_CONFIG) {
    const app = initializeApp(CANVAS_FIREBASE_CONFIG);
    db = getFirestore(app);
    auth = getAuth(app);
}

// --- CONTEXT AND AUTH HOOK ---
const AuthContext = createContext();

const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        if (!auth) {
            setAuthError("Firebase is not initialized. Check firebaseConfig.");
            setLoading(false);
            return;
        }

        const setupAuth = async () => {
            try {
                if (CANVAS_AUTH_TOKEN) {
                    await signInWithCustomToken(auth, CANVAS_AUTH_TOKEN);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase initial authentication error:", error);
                setAuthError("Initial connection failed.");
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                // Clear error if successful
                setAuthError(null); 
            }
        });

        setupAuth();
        return () => unsubscribe();
    }, []);

    // Auth Actions
    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
    const logout = () => signOut(auth);

    return { user, loading, authError, login, signup, logout, db, auth };
};

// --- UTILITY COMPONENTS ---

const Card = ({ children, title }) => (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6 border-b pb-3">{title}</h2>
        {children}
    </div>
);

const FormInput = ({ id, label, type, value, onChange, placeholder = '' }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
        />
    </div>
);

// --- AUTHENTICATION FORMS ---

const AuthForm = ({ isLogin, toggleMode }) => {
    const { login, signup } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred during authentication.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const title = isLogin ? 'Sign In' : 'Sign Up';
    const buttonText = isLogin ? 'Login to Dashboard' : 'Create Account';

    return (
        <Card title={title}>
            <form onSubmit={handleSubmit}>
                <FormInput 
                    id="email" 
                    label="Email Address" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="you@example.com"
                />
                <FormInput 
                    id="password" 
                    label="Password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="min 6 characters"
                />

                {error && (
                    <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg mb-4 border border-red-300">
                        {error.replace('Firebase: ', '')}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center"
                >
                    {isSubmitting ? (
                        <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        buttonText
                    )}
                </button>
            </form>

            <button
                onClick={toggleMode}
                className="mt-6 w-full text-sm text-indigo-500 hover:text-indigo-700 transition duration-150"
            >
                {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
            </button>
        </Card>
    );
};

// --- DASHBOARD COMPONENT ---

const Dashboard = () => {
    const { user, logout, db } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(null);

    // Function to create/update user data in Firestore
    const saveDashboardData = async () => {
        if (!user || !db) return;
        
        try {
            // Firestore path: /artifacts/{appId}/users/{userId}/dashboard_data/profile
            const dataDocRef = doc(db, 'artifacts', CANVAS_APP_ID, 'users', user.uid, DATA_COLLECTION, 'profile');
            
            const newData = {
                message: `Hello, ${user.email || 'User'}! This is your protected content.`,
                lastAccessed: serverTimestamp(),
                userId: user.uid,
                status: 'active'
            };
            
            await setDoc(dataDocRef, newData, { merge: true });
            setLastFetchTime(new Date().toLocaleTimeString());
            setError(null);
        } catch (err) {
            console.error("Error saving data:", err);
            setError("Failed to save data to Firestore.");
        }
    };

    // Real-time listener for the dashboard data
    useEffect(() => {
        if (!user || !db) return;

        // Firestore path: /artifacts/{appId}/users/{userId}/dashboard_data/profile
        const dataDocRef = doc(db, 'artifacts', CANVAS_APP_ID, 'users', user.uid, DATA_COLLECTION, 'profile');
        
        // Fetch initial data or ensure document exists on first load
        const initializeAndSubscribe = async () => {
            const docSnap = await getDoc(dataDocRef);
            if (!docSnap.exists()) {
                await saveDashboardData();
            }

            // Set up real-time listener
            const unsubscribe = onSnapshot(dataDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    setDashboardData(docSnapshot.data());
                    setLastFetchTime(new Date().toLocaleTimeString());
                    setError(null);
                } else {
                    setDashboardData(null);
                }
            }, (err) => {
                console.error("Firestore snapshot error:", err);
                setError("Failed to stream dashboard data.");
            });

            return unsubscribe;
        };

        const unsubscribePromise = initializeAndSubscribe();
        
        // Cleanup function
        return () => {
            unsubscribePromise.then(unsubscribe => {
                if (unsubscribe) unsubscribe();
            });
        };
    }, [user, db]);

    const userEmail = user.email || 'Anonymous User';

    return (
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-4xl mx-auto">
            <header className="flex justify-between items-center border-b pb-4 mb-6">
                <h1 className="text-3xl font-extrabold text-gray-800">Welcome to Your Dashboard!</h1>
                <button
                    onClick={logout}
                    className="flex items-center bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                    <h3 className="text-xl font-bold text-indigo-700 mb-3">User Profile</h3>
                    <p className="text-gray-700 mb-1">
                        <span className="font-semibold">Email:</span> {userEmail}
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold">User ID:</span> <code className="text-xs break-all">{user.uid}</code>
                    </p>
                    <p className="text-xs mt-3 text-indigo-500">
                        Your data is securely scoped to this User ID in Firebase Firestore.
                    </p>
                </div>
                
                <div className="md:col-span-1 bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                    <h3 className="text-xl font-bold text-yellow-700 mb-3">Connectivity</h3>
                    <p className="text-gray-700 mb-1">
                        <span className="font-semibold">Firebase Status:</span> <span className="text-green-600">Active</span>
                    </p>
                    <p className="text-gray-700">
                        <span className="font-semibold">Last Fetch:</span> {lastFetchTime || 'Loading...'}
                    </p>
                    <p className="text-xs mt-3 text-yellow-500">
                        Real-time listener is active for data changes.
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Protected Firestore Data</h3>
                {error && <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg mb-4 border border-red-300">{error}</div>}
                
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 font-mono text-sm overflow-x-auto">
                    {dashboardData ? (
                        <pre className="whitespace-pre-wrap">{JSON.stringify(dashboardData, null, 2)}</pre>
                    ) : (
                        <p className="text-gray-500">Loading protected data...</p>
                    )}
                </div>

                <button
                    onClick={saveDashboardData}
                    className="mt-6 bg-green-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300 shadow-md"
                >
                    Update Data Timestamp (Write Test)
                </button>
            </div>
        </div>
    );
};

// --- MAIN APPLICATION COMPONENT ---

const App = () => {
    return (
        <AuthContext.Provider value={useAuth()}>
            <MainLayout />
        </AuthContext.Provider>
    );
};

const MainLayout = () => {
    const { user, loading, authError } = useContext(AuthContext);
    const [isLoginMode, setIsLoginMode] = useState(true);

    const toggleMode = () => setIsLoginMode(!isLoginMode);

    let content;

    if (!CANVAS_FIREBASE_CONFIG) {
         content = (
            <Card title="Configuration Error">
                <p className="text-red-600">Firebase configuration is missing. Cannot run authentication.</p>
                <p className="mt-4 text-sm text-gray-500">Please refer to the setup guide in the response.</p>
            </Card>
        );
    } else if (authError) {
        content = (
            <Card title="Authentication Error">
                <p className="text-red-600">{authError}</p>
                <p className="mt-4 text-sm text-gray-500">Please check your Firebase configuration and Vercel environment variables.</p>
            </Card>
        );
    } else if (loading) {
        content = (
            <div className="flex flex-col items-center justify-center space-y-4 text-gray-600">
                <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="font-semibold">Connecting to Firebase...</p>
            </div>
        );
    } else if (user) {
        content = <Dashboard />;
    } else {
        content = <AuthForm isLogin={isLoginMode} toggleMode={toggleMode} />;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8 font-sans">
            <script src="https://cdn.tailwindcss.com"></script>
            {content}
        </div>
    );
};

export default App;
