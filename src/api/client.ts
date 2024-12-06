import { cacheExchange, Client, fetchExchange } from "urql";

const token = "";

export const client = new Client({
    url: "https://api.github.com/graphql",
    exchanges: [fetchExchange, cacheExchange],
    fetchOptions() {
        return {
            headers: { authorization: token ? `Bearer ${token}` : "" },
        }
    }
});
