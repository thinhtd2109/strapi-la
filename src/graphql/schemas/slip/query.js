import gql from "graphql-tag";

export const GET_ALL_BOOTH_ORDERS = gql`
query GetAllBoothOrders($where: booth_order_bool_exp!, $skip: Int = 0, $take: Int = 10) {
    total: booth_order_aggregate(where: $where){
        aggregate{
          count
        }
    }
    result: booth_order(where: $where, limit: $take, offset: $skip, order_by: {created_unix: desc}) {
      id
      code
      boothByBooth {
        id
        code
        name
        booth_accounts(where: { deleted: { _eq: false } }) {
          accountByAccount {
            phone
          }
        }
      }
      booth_order_status {
        id
        code
        name
      }
      type
      order_time  
      created
    }
  }
`;



export const GET_ALL_BOOTH = gql`
query MyQuery {
    booth(where: { deleted: { _eq: false } }) {
      id
      code
      name
    }
  }
`