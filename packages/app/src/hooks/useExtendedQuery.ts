import type { ResultOf } from "gql.tada";
import { useEffect, useState } from "react";
import type { OperationResult } from "urql";
import type { UserProfile } from "../api/auth";
import { client } from "../api/client";
import { ContributionQuery } from "../api/query";
import type { ContributionWeeks } from "../api/types";
import { useParametersStore } from "../stores/parameters";

interface ExtendedQueryProps {
	name?: string;
	start: number;
	end: number;
	profile: Promise<UserProfile | null>;
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
	} catch (e) {
		return [];
	}
};

export const useExtendedQuery = (
	props: ExtendedQueryProps,
): ExtendedQueryResult => {
	const [years, setYears] = useState<ContributionWeeks[]>([[]]);
	const [fetching, setFetching] = useState(false);
	const [ok, setOk] = useState(true);
	const [initialized, setInitialized] = useState(false);
	const  setParameters = useParametersStore(state => state.setInputs);
	const init = async () => {
		if (initialized) {
			return null;
		}
		const profile = await props.profile;
		setInitialized(true);
		return profile;
	};

	useEffect(() => {
		if (props.name === undefined) {
			return;
		}

		setFetching(true);
		setOk(true);
		setYears([[]]);
		init()
			.then((profile) => {
				if (profile === null) {
					return props;
				}
				setParameters({ name: profile.login });
				return { ...props, name: profile.login };
			})
			.then((props) => doRangeQuery(props))
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
