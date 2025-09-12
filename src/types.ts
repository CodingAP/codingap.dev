/**
 * the body for a login request
 */
interface LoginRequestBody {
    /**
     * the password sent
     */
    password: string;

    /**
     * only checks, doesn't create new token
     */
    check?: boolean;
};

/**
 * the body for a create post request
 */
interface CreatePostRequestBody {
    /**
     * title of the post
     */
    title: string;

    /**
     * url id of the post
     */
    id: string;
};

/**
 * the custom json web token 
 */
interface JSONToken {
    /**
     * the timestamp of the log in 
     */
    timestamp: string;

    /**
     * the id of the user
     */
    id: string;
};

/**
 * post data object 
 */
interface Post {
    /**
     * numeric id from the database
     */
    id: number;

    /**
     * text id used for the url/searching
     */
    urlID: string;

    /**
     * title of the post
     */
    title: string;

    /**
     * author of the post
     */
    author: string;

    /**
     * timestamp when post was created
     */
    created: Date;

    /**
     * timestamp when post was updated
     */
    updated: Date;

    /**
     * raw data for post (still has markdown/custom tags)
     */
    content: string;

    /**
     * is post visible to the public
     */
    visible: boolean;
};

/**
 * tries to map the data from the db to an object
 * 
 * @param data data from the database
 * @returns a type-correct version or nothing
 */
const mapPostFromDB = (data: Record<string, string> | undefined): Post | undefined => {
    if (data === undefined) return undefined;

    return {
        id: parseInt(data['POST_ID']),
        urlID: data['URL_ID'],
        title: data['TITLE'],
        author: data['AUTHOR'],
        created: new Date(data['CREATED']),
        updated: new Date(data['UPDATED']),
        content: data['POST'],
        visible: data['VISIBLE'] === '1'
    };
}

export type {
    LoginRequestBody,
    CreatePostRequestBody,
    Post,
    JSONToken
};

export {
    mapPostFromDB
};