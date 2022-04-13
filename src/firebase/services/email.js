import firebase from '../config/firebase';
import * as _ from "lodash";
import "firebase/auth";

export const signInWithEmailPassword = async (email, password) => {
    // [START auth_signin_password]
    try {
        let userInfo = {};
        let user = await firebase.auth().signInWithEmailAndPassword(email, password);
        let token = await firebase.auth().currentUser.getIdToken(true);
        _.set(userInfo, 'access_token', token);
        _.set(userInfo, 'refresh_token', _.get(user, 'user.refreshToken'));
        _.set(userInfo, 'uid', _.get(user, 'user.uid'));
        _.set(userInfo, 'email', _.get(user, 'user.email'));
        return userInfo;
    } catch (error) {
        return error;
    }
}

export async function signUpWithEmailPassword(email, password) {
    // [START auth_signup_password]
    try {
        let newUser = await firebase.auth().createUserWithEmailAndPassword(email, password);
        return newUser;
    } catch (error) {
        return error;
    }
}

export function sendEmailVerification() {
    // [START auth_send_email_verification]
    firebase.auth().currentUser.sendEmailVerification()
        .then(() => {
            // Email verification sent!
            // ...
        });
    // [END auth_send_email_verification]
}

export async function sendPasswordReset(email) {
    // [START auth_send_password_reset]
    return await firebase.auth().sendPasswordResetEmail(email);
    // [END auth_send_password_reset]
}