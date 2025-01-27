import { useEffect } from "react";

export interface DebounceOptions {
    beforeDebounceInit?(): void;
    onDebounce(): void;
    afterDebounceInit?(): void;
}

export const useDebounce = (options: DebounceOptions, ms: number, deps: unknown[]) => {
    let timeout: NodeJS.Timeout | undefined = undefined;
    useEffect(() => {
        if (timeout !== undefined) {
            clearTimeout(timeout);
        }
        options.beforeDebounceInit?.();
        timeout = setTimeout(() => options.onDebounce(), ms)
        options.afterDebounceInit?.();
        return () => {
            if (timeout !== undefined) {
                clearTimeout(timeout);
            }
        }
    }, deps);
}