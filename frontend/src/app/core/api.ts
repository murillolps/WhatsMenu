import { HttpErrorResponse } from '@angular/common/http';

export const API_URL = 'http://localhost:3333';

interface ApiErrorBody {
  errors?: { message: string }[];
}

/**
 * Converte a resposta de erro da API (formato `{ errors: [{ message }] }`)
 * em uma mensagem legível para o usuário.
 */
export function extractErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Erro inesperado.';
  }

  if (error.status === 0) {
    return 'Não foi possível conectar à API. Verifique se o backend está rodando.';
  }

  const messages = (error.error as ApiErrorBody | null)?.errors?.map((e) => e.message);
  return messages?.length ? messages.join(' • ') : `Erro ${error.status}: ${error.statusText}`;
}
