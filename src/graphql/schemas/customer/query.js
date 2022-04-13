import { gql } from "@apollo/client";

export const GET_CUSTOMER_LIST = gql`
  query getCustomers($where: account_bool_exp!, $skip: Int!, $take: Int!) {
    total: account_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    customers: account(order_by:{code:desc},where: $where, offset: $skip, limit: $take) {
      id
      code
      full_name
      phone
      created
      orders_aggregate {
        aggregate {
          count
        }
      }
      account_referral: account {
        id
        code
        full_name
      }
      pinnow_e_Wallet: wallets {
        amount 
      }
    }
  }
`;

export const GET_CUSTOMER_DETAIL = gql`
  query GetCustomerDetail($id: uuid!) {
    account(where: { id: { _eq: $id } }) {
      full_name
      code
      phone
      avatar: medium {
        name
        url
      }
      account_referral: account {
        id
        code
        full_name
      }
      pinnow_e_Wallet: wallets {
        id
        amount
        wallet_type{
          id
          code
          name
        } 
      }
      created
      orders(where: {deleted: {_eq: false}, order_status: {code: {_neq: "INITIAL"}}}) {
        id
        code
        order_status {
          name
          code
        }
        created
        total_amount
        amount
        order_items {
          quantity
          productByProduct {
            name
            code
            price
            photo: medium {
              name
              url
            }
          }
        }
      }
    }
  }
`;
