import type { ResultOf } from "gql.tada";
import { useEffect, useState } from "react";
import type { OperationResult } from "urql";
import { client } from "../api/client";
import { ContributionQuery } from "../api/query";
import type { ContributionWeeks } from "../api/types";

interface ExtendedQueryProps {
	name?: string;
	start: number;
	end: number;
}

export interface ExtendedQueryResult {
	years: ContributionWeeks[];
	fetching: boolean;
	ok: boolean;
}

const doRangeQuery = async (props: ExtendedQueryProps) => {
	if (props.name === undefined) {
		return [];
	}
	const { name, start, end } = props;
	const queries: Promise<
		OperationResult<ResultOf<typeof ContributionQuery>>
	>[] = [];
	for (let i = start; i <= end; i++) {
		const promise = client
			.query(ContributionQuery, {
				name,
				start: `${i}-01-01T00:00:00Z`,
				end: `${i}-12-31T00:00:00Z`,
			})
			.toPromise();
		queries.push(promise);
	}
	try {
		const results = await Promise.all(queries);
		const years: ContributionWeeks[] = [];
		for (const result of results) {
			if (result.data?.user) {
				years.push(
					result.data.user.contributionsCollection.contributionCalendar.weeks,
				);
			} else {
				return [];
			}
		}
		return years;
	} catch (_e) {
		return [];
	}
};

export const useExtendedQuery = (
	props: ExtendedQueryProps,
): ExtendedQueryResult => {
	const [years, setYears] = useState<ContributionWeeks[]>([[]]);
	const [fetching, setFetching] = useState(false);
	const [ok, setOk] = useState(true);
	useEffect(() => {
		if (props.name === undefined) {
			return;
		}

		setFetching(true);
		setOk(true);
		setYears([[]]);
		doRangeQuery(props)
			.then((result) => {
				setYears(result);
				if (result.length === 0) {
					setOk(false);
				}
			})
			.catch(console.error)
			.finally(() => setFetching(false));
	}, [props.name, props.start, props.end]);
	return { years, fetching, ok };
};
