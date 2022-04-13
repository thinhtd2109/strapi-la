import * as _ from "lodash";
import jwt_decode from "jwt-decode";

class User {
    initial() {
        return {
        }
    }

    getValue(key) {
        try {
            let value = JSON.parse(localStorage.getItem("userInfo", {}));
            if (!_.isEmpty(value)) {
                return _.get(value, key, {});
            } else {
                return null;
            }
        } catch (error) {
            return null
        }
    }

    async setUserInfo(data) {
        try {
            var user = {};
            let token = data.access_token;
            if (!_.isEmpty(token)) {
                var decoded = jwt_decode(token);
                let hasura = _.get(decoded, 'https://hasura.io/jwt/claims');
                _.set(user, 'role', _.get(hasura, "x-hasura-business-roles"));
                _.set(user, 'id', _.get(hasura, "x-hasura-account-id"));

            }
            localStorage.setItem('userInfo', JSON.stringify(user));
        } catch (error) {
            throw error
        }

    }

    removeUserInfo() {
        localStorage.removeItem("userInfo");
    }

    reset() {
        localStorage.clear();
    }
}

export const user = new User();