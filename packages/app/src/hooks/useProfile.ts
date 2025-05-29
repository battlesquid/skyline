import { ResultOf } from "gql.tada";
import { useEffect, useState } from "react";
import { OperationResult } from "urql";
import { client } from "../api/client";
import { UserQuery } from "../api/query";

export const useProfile = () => {
    const [name, setName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        client.query(UserQuery, {})
            .then((result: OperationResult<ResultOf<typeof UserQuery>>) => {

            })
    }, [])

    return { name, avatarUrl };
}