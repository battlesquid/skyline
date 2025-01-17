export const groupby = <T>(arr: T[], keyFn: (item: T) => any) => {
    return arr.reduce<Record<string, T[]>>((groups, curr) => {
        (groups[keyFn(curr)] ??= []).push(curr);
        return groups;
    }, {});
}