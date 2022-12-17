import { jwt_secret_key } from "config";
import { JwtPayload, verify } from "jsonwebtoken";


export function authorizeToken(tokenString: string): {
    payload?: JwtPayload,
    isValid: boolean
} {

    if (typeof tokenString != 'string') {
        throw new TypeError('expected token to be string got: ' + JSON.stringify(tokenString));
    }

    const [_token_type, token] = tokenString.split(' ');

    let payload: JwtPayload | string;

    try {
        payload = verify(token, jwt_secret_key) as JwtPayload;

        return {
            payload: payload,
            isValid: true
        }
    } catch {
        return {
            payload: undefined,
            isValid: false
        };
    }
}