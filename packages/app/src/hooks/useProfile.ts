import { useEffect, useMemo, useState } from "react";
import { fetchProfile, type UserProfile } from "../api/auth";

export const useProfile = () => {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(false);

    const fetchProfilePromise = useMemo(() => fetchProfile(), []);
	const [promise] = useState(fetchProfilePromise);
    
	useEffect(() => {
        if (loading) {
            console.log("exiting")
            return;
        } 
        setLoading(true);
		fetchProfilePromise
			.then(setProfile)
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	return { profile, promise, loading };
};
