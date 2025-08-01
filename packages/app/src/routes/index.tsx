import { createFileRoute, redirect } from '@tanstack/react-router';
import { useRef } from "react";
import { fetchProfile, isAuthenticated } from "../api/auth";
import { EditorAppShell } from "../components/appshell";
import { createParametersStore, ParametersContext } from "../stores/parameters";
import "../styles/editor.css";

export const Route = createFileRoute('/')({
    component: Editor,
    beforeLoad: ({ location }) => {
        if (!isAuthenticated()) {
            throw redirect({
                to: "/login",
                reloadDocument: true,
                search: {
                    redirect: location.href
                }
            })
        }
    },
    loader: async () => {
        const profile = await fetchProfile()
        return profile;
    }
});

export function Editor() {
    const profile = Route.useLoaderData();
    const store = useRef(createParametersStore({ name: profile?.login ?? "" })).current;

    return (
        <ParametersContext.Provider value={store}>
            <EditorAppShell profile={profile} />
        </ParametersContext.Provider>
    )
}
