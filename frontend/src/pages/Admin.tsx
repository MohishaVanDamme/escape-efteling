import { useEffect, useState } from "react";
import { Button, Input, Label } from "@heroui/react";
import { supabase } from "../lib/supabase";
import AdminDashboard from "../components/admin/AdminDashbord";

export default function Admin() {
    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL;

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoggedIn(session?.user?.email === ADMIN_EMAIL);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function handleLogin() {
        setError("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError("Onjuiste e-mail of wachtwoord.");
            return;
        }

        const { data } = await supabase.auth.getUser();

        if (data.user?.email !== ADMIN_EMAIL) {
            await supabase.auth.signOut();
            setError("Je bent geen administrator.");
            return;
        }

        setLoggedIn(true);
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        setLoggedIn(false);
        setEmail("");
        setPassword("");
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Laden...
            </div>
        );
    }

    if (!loggedIn) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                    <h1 className="mb-6 text-2xl font-bold text-center">
                        Beheerder inloggen
                    </h1>

                    <div className="flex flex-col gap-4">
                        <Label>E-mailadres</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Label>Wachtwoord</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    void handleLogin();
                                }
                            }}
                        />

                        {error && (
                            <p className="text-sm text-red-500">
                                {error}
                            </p>
                        )}

                        <Button
                            onPress={handleLogin}
                        >
                            Inloggen
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AdminDashboard handleLogout={handleLogout} />
    );
}