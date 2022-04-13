import gql from "graphql-tag";

export const CREATE_BOOTH_ORDER = gql`
mutation CreateBoothOrder($data: CreateBoothOrderInput!) {
    createBoothOrder(data: $data) {
      success
      affected_rows
    }
  }
  
`

export const UPDATE_ORDER_STATUS = gql`

mutation UpdateBoothOrderStatus($data: UpdateBoothOrderStatusInput!) {
  updateBoothOrderStatus(args: $data) {
    success
  }
}

`