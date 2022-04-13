import { default as axios } from "axios";

const baseURL = "https://strapi-core.herokuapp.com/api";

const getAuthorization = () => {
  let access_token = localStorage.getItem("access_token");
  if (access_token) {
    return {
      authorization: `Bearer ${access_token}`,
    };
  }

  return {};
};

// create interface
export const strapiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
strapiClient.interceptors.request.use(
  function (config) {
    config.headers = { ...getAuthorization() };
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
strapiClient.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    return Promise.reject(error.response.data.error);
  }
);
