import { useEffect, useState } from 'react';

export type StorageKey = 'tab';
export type StorageValue = 'textbox' | 'oneline' | 'images' | 'webworker' | 'pdfworker';

export function useLocalStorage<T extends StorageValue>(
	key: StorageKey,
	initialValue: T
) {
	// Get initial value from localStorage or use provided initialValue
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(error);
			return initialValue;
		}
	});

	// Update localStorage when state changes
	useEffect(() => {
		try {
			window.localStorage.setItem(key, JSON.stringify(storedValue));
		} catch (error) {
			console.error(error);
		}
	}, [key, storedValue]);

	return [storedValue, setStoredValue] as const;
}
