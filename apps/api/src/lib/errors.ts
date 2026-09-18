/** Erros de API com status HTTP. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const badRequest = (msg: string, details?: unknown) => new ApiError(400, msg, details);
export const unauthorized = (msg = "Sessão expirada. Entre novamente.") => new ApiError(401, msg);
export const forbidden = (msg = "Sem permissão para esta operação.") => new ApiError(403, msg);
export const notFound = (msg = "Recurso não encontrado.") => new ApiError(404, msg);
export const conflict = (msg: string) => new ApiError(409, msg);
