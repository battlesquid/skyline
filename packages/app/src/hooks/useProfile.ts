import { useEffect, useState } from "react"
import { fetchProfile, UserProfile } from "../api/auth"

export const useProfile = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfilePromise = fetchProfile();
    const [promise] = useState(fetchProfilePromise);

    useEffect(() => {
        fetchProfilePromise
            .then(setProfile)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, []);

    return { profile, promise, loading }
}