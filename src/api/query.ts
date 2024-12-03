import { graphql } from "./graphql";

export const ContributionQuery = graphql(`
  query ContributionQuery($name: String!, $start: DateTime!, $end: DateTime!) {
    user(login: $name) {
      name
      contributionsCollection(from: $start, to: $end) {
        contributionCalendar {
          colors
          totalContributions
          weeks {
            contributionDays {
              color
              contributionCount
              date
              weekday
            }
            firstDay
          }
        }
      }
    }
  }
`);
