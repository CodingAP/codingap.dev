type Handler = (request: Request, params: { [key: string]: string }) => Promise<Response>;
type Router = { [key: string]: { [key: string]: Handler } };

interface LoginRequestBody {
    password: string;
    check?: boolean;
};

interface JSONToken {
    loggedIn: string;
    id: string;
}

export type {
    LoginRequestBody,
    JSONToken,
    Router,
    Handler
};