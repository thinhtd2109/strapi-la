import { gql } from "@apollo/client";

export const GET_ACCOUNT_INFO = gql`
query GetAccount($id: uuid!) {
  account(where: {id: {_eq: $id}}) {
    email
    full_name
    medium{
      name
      url
    }
    account_roles {
      roleByRole {
        name
      }
    }
  }
}

`