import {
	Avatar,
	Combobox,
	ComboboxDropdown,
	ComboboxOption,
	ComboboxTarget,
	Group,
	Input,
	InputWrapper,
	Text,
	useCombobox,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import { client } from "../../api/client";
import { SearchUsersQuery } from "../../api/query";

export type GitHubUser = {
	login: string;
	avatar_url: string;
};

async function fetchGitHubUsers(query: string): Promise<GitHubUser[]> {
	if (!query) return [];
	const result = await client.query(SearchUsersQuery, { query }).toPromise();
	if (result.error) {
		console.error("Error fetching GitHub users:", result.error);
		return [];
	}
	if (!result.data) {
		console.warn("No data returned from GitHub users query.");
		return [];
	}
	const nodes = (result.data.search.nodes ?? []) as Array<
		{ login?: string; avatarUrl?: string } | null | undefined
	>;
	return nodes
		.filter(
			(node): node is { login: string; avatarUrl: string } =>
				!!node &&
				typeof node.login === "string" &&
				typeof node.avatarUrl === "string",
		)
		.map((node) => ({ login: node.login, avatar_url: node.avatarUrl }));
}

interface GitHubUsernameInputProps
	extends Omit<
		React.ComponentPropsWithoutRef<typeof Input>,
		"value" | "defaultValue" | "onChange"
	> {
	debounceMs?: number;
	placeholder?: string;
	value?: string;
	defaultValue?: string;
	onChange?: (login: string) => void;
	label?: string;
	description?: string;
	error?: string;
	required?: boolean;
}

export function GitHubUsernameInput({
	debounceMs = 500,
	placeholder,
	value,
	defaultValue,
	onChange,
	label,
	description,
	error,
	required,
	...inputProps
}: GitHubUsernameInputProps) {
	const isControlled = value !== undefined;
	const [internalValue, setInternalValue] = useState(defaultValue || "");
	const inputValue = isControlled ? (value ?? "") : internalValue;
	const [debounced] = useDebouncedValue(inputValue, debounceMs);
	const [users, setUsers] = useState<GitHubUser[]>([]);
	const [loading, setLoading] = useState(false);
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
	});
	const didMount = useRef(false);

	useEffect(() => {
		if (isControlled && didMount.current) {
			setInternalValue(value ?? "");
		}
		didMount.current = true;
	}, [value, isControlled]);

	useEffect(() => {
		let ignore = false;
		if (!debounced) {
			setUsers([]);
			return;
		}
		setLoading(true);
		fetchGitHubUsers(debounced)
			.then((res) => {
				if (!ignore) setUsers(res);
			})
			.finally(() => {
				if (!ignore) setLoading(false);
			});
		return () => {
			ignore = true;
		};
	}, [debounced]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.currentTarget.value;
		if (!isControlled) setInternalValue(val);
		onChange?.(val);
		combobox.openDropdown();
	};

	const handleOptionSubmit = (login: string) => {
		if (!isControlled) setInternalValue(login);
		onChange?.(login);
		combobox.closeDropdown();
	};

	return (
		<InputWrapper
			label={label}
			description={description}
			error={error}
			required={required}
		>
			<Combobox store={combobox} onOptionSubmit={handleOptionSubmit}>
				<ComboboxTarget>
					<Input
						value={inputValue}
						onChange={handleInputChange}
						placeholder={placeholder ?? "GitHub Username"}
						onFocus={() => combobox.openDropdown()}
						autoComplete="off"
						{...inputProps}
					/>
				</ComboboxTarget>
				<ComboboxDropdown>
					{loading ? (
						<ComboboxOption disabled value="loading">
							Loading...
						</ComboboxOption>
					) : users.length > 0 ? (
						users.map((user) => (
							<ComboboxOption key={user.login} value={user.login}>
								<Group gap="xs" align="center">
									<Avatar
										size="sm"
										src={user.avatar_url}
										alt={`${user.login}'s avatar`}
									/>
									<Text size="sm">{user.login}</Text>
								</Group>
							</ComboboxOption>
						))
					) : (
						<ComboboxOption disabled value="no-results">
							No results
						</ComboboxOption>
					)}
				</ComboboxDropdown>
			</Combobox>
		</InputWrapper>
	);
}
