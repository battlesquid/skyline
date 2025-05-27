import { useEffect, useState } from "react";
import { ContributionWeeks } from "../api/types";
import { client } from "../api/client";
import { ContributionQuery } from "../api/query";
import { OperationResult } from "urql";
import { ResultOf } from "gql.tada";

interface ExtendedQueryProps {
    name: string;
    start: number;
    end: number;
}

export interface ExtendedQueryResult {
    years: ContributionWeeks[];
    fetching: boolean;
}

const doRangeQuery = async (props: ExtendedQueryProps) => {
    const { name, start, end } = props;
    const queries: Promise<OperationResult<ResultOf<typeof ContributionQuery>>>[] = [];
    for (let i = start; i <= end; i++) {
        const promise = client.query(ContributionQuery, {
            name,
            start: `${i}-01-01T00:00:00Z`,
            end: `${i}-12-31T00:00:00Z`
        }).toPromise();
        queries.push(promise);
    }
    try {
        const results = await Promise.all(queries);
        const years: ContributionWeeks[] = [];
        for (const result of results) {
            if (result.data?.user) {
                years.push(result.data.user.contributionsCollection.contributionCalendar.weeks)
            } else {
                return [];
            }
        }
        return years;
    } catch (e) {
        return [];
    }
}

export const useExtendedQuery = (props: ExtendedQueryProps): ExtendedQueryResult => {
    const [years, setYears] = useState<ContributionWeeks[]>([[]]);
    const [fetching, setFetching] = useState(false);
    useEffect(() => {
        setFetching(true);
        setYears([[]]);
        doRangeQuery(props)
            .then(setYears)
            .catch(console.error)
            .finally(() => setFetching(false))
    }, [props.name, props.start, props.end])
    return { years, fetching }
}