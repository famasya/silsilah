import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetcher = (input: URL | RequestInfo, init?: RequestInit | undefined) => fetch(input, init).then(res => res.json())
