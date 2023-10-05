type SuccessResponse<T> = { status: 200; data: T } | { status: 201; data: T };

type ErrorResponse =
  | { status: 400; error: Error }
  | { status: 404; error: Error }
  | { status: 500; error: Error };

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

function createSuccessResponse<T>(
  status: 200 | 201,
  data: T
): SuccessResponse<T> {
  return { status, data };
}

function createErrorResponse(
  status: 400 | 404 | 500,
  error: Error
): ErrorResponse {
  return { status, error };
}

export {
  SuccessResponse,
  ErrorResponse,
  ApiResponse,
  createErrorResponse,
  createSuccessResponse,
};
