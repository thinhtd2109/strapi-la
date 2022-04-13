import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  split,
  HttpLink,

} from "@apollo/client";
import { createUploadLink } from "apollo-upload-client";
import * as _ from "lodash";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

import { getMainDefinition } from "apollo-utilities";

export const ssrMode = typeof window === "undefined";

const url = process.env.REACT_APP_API_GRAPHQL;

const getAuthorization = () => {
  let access_token = localStorage.getItem("access_token");
  if (access_token) {
    return {
      "Access-Control-Allow-Origin": "*",
      authorization: `Bearer ${access_token}`,
    };
  }

  return {};
};

const authLink = setContext(async (_, { headers }) => {
  return {
    headers: {
      ...getAuthorization(),
      ...headers /** Please don't edit the order */,
    },
  };
});

//1. create websocket link
// const wsLink = new WebSocketLink({
//   uri: process.env.REACT_APP_GRAPHQL_WS_ENDPOINT,
//   options: {
//     reconnect: true,
//     connectionParams: {
//       headers: {
//         "hasura-client-name": process.env.REACT_APP_API_GRAPHQL,
//         ...getAuthorization(),
//         //...headers, /** Please don't edit the order */
//       },
//     },
//   },
// });

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_API_GRAPHQL,
});

console.log(process.env.REACT_APP_API_GRAPHQL)


const errorLink = onError(
  ({ networkError, graphQLErrors, operation, forward }) => {
    /** Handle reset token */
    try {
      _.map(graphQLErrors, ({ message, extensions }) => {

        console.log("[Graphql error]:", message);
      });
      if (networkError) {
        console.log(networkError);
        console.log(`[Network error]: ${networkError}`);
      }
    } catch (error) {
      console.log("Error Link: ", error);
    }
  }
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  //wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: ApolloLink.from([authLink, errorLink, splitLink, createUploadLink({ uri: url, credentials: 'same-origin' })]),
  cache: new InMemoryCache(),
});
