import { ResultOf } from "gql.tada";
import { ContributionQuery } from "./query";

export type ContributionWeeks = NonNullable<ResultOf<typeof ContributionQuery>["user"]>["contributionsCollection"]["contributionCalendar"]["weeks"];
