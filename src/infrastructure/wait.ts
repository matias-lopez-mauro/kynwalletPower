/** Espera simulada de los gateways en memoria (FR-008 de 001, FR-011 de 002). */
export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
