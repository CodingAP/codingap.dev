type Handler = (request: Request, url: { [key: string]: string }) => Promise<Response>;
type Router = { [key: string]: { [key: string]: Handler } };

export type {
    Router,
    Handler
};