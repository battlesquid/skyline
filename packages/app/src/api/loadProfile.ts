import { client } from "./client";
import { UserQuery } from "./query";

export interface UserProfile {
    name?: string;
    avatarUrl?: string;
    login?: string;
    logout: () => void;
}

export const loadProfile = async () => {
    const result = await client.query(UserQuery, {}).toPromise();
    return {
        name: result.data?.viewer.name,
        avatarUrl: result.data?.viewer.avatarUrl,
        login: result.data?.viewer.login
    }
}
