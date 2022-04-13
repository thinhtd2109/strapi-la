import { notification } from "antd";
import axios from "axios";
import * as _ from 'lodash';
import { user } from "../../constant/user";

const url = `https://securetoken.googleapis.com/v1/token?key=${process.env.REACT_APP_FIREBASE_API_KEY}`;

export const refreshToken = async () => {
    const current_refresh_token = localStorage.getItem('refresh_token');
    const formData = {
        grant_type: "refresh_token",
        refresh_token: current_refresh_token
    };
    try {
        const res = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        localStorage.setItem('access_token', _.get(res, 'data.access_token'));
        localStorage.setItem('refresh_token', _.get(res, 'data.refresh_token'));
        window.location.reload();
    } catch (error) {
        notification['warning']({
            message: "Hết phiên làm việc!",
            description: "Vui lòng đăng nhập lại"
        })
        user.reset();
        window.location.reload();
    }

}

export const removeSession = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}