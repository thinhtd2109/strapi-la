import { gql } from '@apollo/client';

export const GET_LIST_ORDER_BOOTH = gql`
query GetBoothOrderByCode($booth: uuid, $code: String) {
  booth_order(where: {booth: {_eq: $booth}, code: {_eq: $code}, deleted: {_eq: false}}) {
    id
    code
    type
    order_time
    received_time
    booth_order_status {
      id
      code
      name
    }
    booth
    boothByBooth {
      id 
      code 
      name
    }
    created_by
    booth_order_items(where: {deleted: {_eq: false}}) {
      price
      amount
      package
      quantity
      product_type {
        name
      }
      product_sku {
        sku
      }
      product: productByProduct {
        id
        code
        name
        unitByUnit {
          name
        }
        product_status {
          name
        }
        photo: medium {
          url
        }
      }
    }
  }
}

  
  
`

export const GET_LIST_STATUS_ORDER_BOOTH = gql`
query getListStatusOrderBooth {
  results:booth_order_status(where:{ deleted: { _eq: false } }) {
    id 
    code
    name 
  }
}
`

