import { gql } from "@apollo/client";
import { CORE_SCHEMA_FIELDS } from "../core/fragment";

export const GET_ORDER_LIST_HISTORY_EXPORT = gql`
  ${CORE_SCHEMA_FIELDS}
query GetOrderShipperHistory($where: view_order_shipper_history_bool_exp!) {
  result: view_order_shipper_history(where: $where) {
    orderByOrder {
      code
      created
      order_status {
        code
        name
      }
      order_type {
        code
        name
      }
      order_status_record {
        created
      }
      addressByAddress {
        ...addressData
      }
    }
    shimentByShipment {
      shipment_status_record {
        longitude
        latitude
      }
      delay_delivery #trễ giờ
      delay_gg_est # chậm giờ
    }
    shipperWarningStatus{
      code
      name
    }
    total_call_warning
  }
  
  total: view_order_shipper_history_aggregate(where: $where){
    aggregate{
      count
    }
  }
}
`

export const GET_ORDER_LIST_SHIPPER_HISTORY = gql`
  ${CORE_SCHEMA_FIELDS}
query GetOrderShipperHistory($skip: Int = 0, $take: Int = 10, $where: view_order_shipper_history_bool_exp!) {
  result: view_order_shipper_history(limit: $take, offset: $skip, where: $where) {
    orderByOrder {
      id
      code
      created
      order_status {
        code
        name
      }
      order_type {
        code
        name
      }
      order_status_record {
        created
      }
      addressByAddress {
        ...addressData
      }
    }
    shimentByShipment {
      shipment_status_record {
        longitude
        latitude
      }
      delay_delivery #trễ giờ
      delay_gg_est #chậm giờ
    }
    shipperWarningStatus{
      code
      name
    }
    total_call_warning
  }
  total: view_order_shipper_history_aggregate(where: $where){
    aggregate{
      count
    }
  }
}



`

export const GET_ORDER_LIST_SELECTION = gql`
  query GetOrderList($where: order_bool_exp!) {
    total: order_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    order(order_by: {code:desc},where: $where) {
      id
      code
      print_count
      order_group{
        id
        code
      }
      created
      paymentMethodByPaymentMethod {
        name
      }
      order_booths(where: {deleted:{_eq:false}}){
        boothByBooth{
          id
          code
        }
      }
      shipments(limit: 1, order_by: {created: desc}) {
        shipperByShipper {
          id
          code
        }
      }
      order_type {
        name
      }
      paymentMethodByPaymentMethod {
        code
        name
      }
      account {
        id
        full_name
        phone
        code
      }
      amount
      pinnow_amount
      voucher_amount
      total_amount
      address: addressByAddress {
        ...addressData
      }
      order_status {
        code
        name
        id
        index
      }
      promotionComboByPromotionCombo {
        code
        name
        promotion_products {
          productByProduct {
           name
           quantity
           price
           unitByUnit {
            name
           }
          }
        }
      }
      order_items{
        productByProduct{
         code
         name
        }
        quantity
        price
        wholesale_price
        wholesale_quantity
        amount
        package 
        product_type {
          name
        }
        sale_price
      }
    }
    
  }
    fragment addressData on address {
    phone
    name
    number
    longitude
    latitude
    deliveryTimeByDeliveryTime{
      name
    }   
    street: streetByStreet {
      id
      name
    }
    ward: wardByWard {
      id
      name
    }
    district: districtByDistrict {
      id
      name
    }
    province: provinceByProvince {
      id
      name
    }
  }
`

export const GET_ORDER_LIST = gql`
  ${CORE_SCHEMA_FIELDS}
  query GetOrderList($where: order_bool_exp!, $skip: Int!, $take: Int!) {
    total: order_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    order(order_by: {code:desc},where: $where, offset: $skip, limit: $take) {
      id
      code
      print_count
      order_group{
        id
        code
      }
      created
      paymentMethodByPaymentMethod {
        name
      }
      order_booths(where: {deleted:{_eq:false}}){
        boothByBooth{
          id
          code
        }
      }
      shipments(limit: 1, order_by: {created: desc}) {
        shipperByShipper {
          id
          code
        }
      }
      order_type {
        name
      }
      paymentMethodByPaymentMethod {
        code
        name
      }
      account {
        id
        full_name
        phone
        code
      }
      amount
      pinnow_amount
      voucher_amount
      total_amount
      address: addressByAddress {
        ...addressData
      }
      order_status {
        code
        name
        id
        index
      }
    }
    
  }
`;

export const GET_ORDER_DETAIL = gql`
  ${CORE_SCHEMA_FIELDS}
  query GetOrder($orderId: uuid!) {
    order(where: { id: { _eq: $orderId }, deleted: { _eq: false } }) {
      id
      code
      address: addressByAddress {
        ...addressData
      }
      created
      est_delivery_time
      delivery_time_unit
      delivery_price
      amount
      delivery_price
      voucher_amount
      note
      total_amount
      pinnow_amount
      group
      order_status_record{
        remark
      }
      rating_reviews{
        rating_review_type{
          id
          code
        }
        star
        review
      }    
      order_status {
        id
        name
        index
        code
      }
      promotionComboByPromotionCombo {
        code
        name
        promotion_products {
          productByProduct {
           name
           quantity
           price
           unitByUnit {
            name
           }
          }
        }
      }
      shipments(limit: 1, order_by: {created_unix: desc}) {
        shipperByShipper {
          id
          code
        }
        shipment_status {
          code
          name
        }
        shipment_status_record {
          longitude
          latitude
        }
      }
      order_type {
        code
        name
      }
      paymentMethodByPaymentMethod {
        code
        name
      }
      order_booths(where: {deleted:{_eq:false}}){
        boothByBooth{
          id
          code
        }
      }
      order_items {
        productByProduct {
          code
          name
          vendorByVendor {
            name
          }
          photo: medium {
            name
            url
          }
        }
        product_type {
          name
        }
        price
        quantity
        package
        wholesale_price
        wholesale_quantity
        amount
        sale_price
      }
    }
  }
`;

export const GET_ORDER_STATUS = gql`
  query getOrderStatus($nextIndex: smallint!) {
    order_status(
      where: {
        _or: [{ index: { _eq: $nextIndex } }, { code: { _eq: "CANCELLED" } }]
      }
    ) {
      id
      code
      name
    }
  }
`;

export const GET_ORDER_GROUP_STATUS = gql`
  query getOrderGroupStatus($nextIndex: smallint!) {
    order_group_status(
      where: {
        _or: [{ index: { _eq: $nextIndex } }, { code: { _eq: "CANCELLED" } }]
      }
    ) {
      id
      code
      name
    }
  }
`;

export const GET_ALL_ORDER_STATUS = gql`
  query getOrderStatus {
    order_status(where: {code: {_nin: ["INITIAL","WAIT_PAYMENT","PAYMENT_FAILED"]}}, order_by: {index: asc}) {
      code
      name
      id
      index
    }
  }
`;

export const GET_ALL_ORDER_GROUP_STATUS = gql`
query getOrderGroupStatus {
  order_group_status {
    id
    code
    name
  }
}
`

export const GET_ORDER_HISTORY = gql`
  query GetOrderStatusHistory($id: uuid!) {
    order: order_by_pk(id: $id) {
      id
      code
      created
    }
    histories: order_status_record(
      order_by: { created: desc }
      where: { order: { _eq: $id } }
    ) {
      id
      created
      order_status {
        id
        code
        name
      }
      account {
        id
        full_name
        email
      }
    }
  }
`;



export const GET_NEWEST_ORDERS = gql`
  ${CORE_SCHEMA_FIELDS}
  query GetNewestOrders($skip: Int!, $take: Int!, $where: order_bool_exp!) {
    order(offset: $skip, limit: $take, where: $where) {
      id
      code
      created
      total_amount
      address: addressByAddress {
        ...addressData
      }
      order_status {
        code
        name
      }
    }
  }
`;

export const GET_ORDER_GROUP_DETAIL = gql`
 ${CORE_SCHEMA_FIELDS}
query GetOrderGroupDetail($where: order_group_bool_exp!, $order_where: order_bool_exp!) {
  order_group(where: $where) {
    id
    code
    created
    order_group_status{
      code
      index
      name
    }
    orders(order_by:{created:asc}, where: $order_where) {
      id
      code
      address: addressByAddress {
        ...addressData
      }
      created
      est_delivery_time
      delivery_time_unit
      delivery_price
      amount
      delivery_price
      voucher_amount
      note
      total_amount
      pinnow_amount
      group
      order_status_record{
        remark
      }
      rating_reviews{
        rating_review_type{
          id
          code
        }
        star
        review
      }    
      order_status {
        id
        name
        index
        code
      }
      promotionComboByPromotionCombo {
        code
        name
        promotion_products {
          productByProduct {
           name
           quantity
           price
           unitByUnit {
            name
           }
          }
        }
      }
      shipments(limit: 1, order_by: {created_unix: desc}) {
        shipperByShipper {
          id
          code
        }
        shipment_status {
          code
          name
        }
        shipment_status_record {
          longitude
          latitude
        }
      }
      order_type {
        code
        name
      }
      paymentMethodByPaymentMethod {
        code
        name
      }
      order_booths(where: {deleted:{_eq:false}}){
        boothByBooth{
          id
          code
        }
      }
      order_items {
        productByProduct {
          code
          name
          vendorByVendor {
            name
          }
          photo: medium {
            name
            url
          }
        }
        product_type {
          name
        }
        price
        quantity
        package
        wholesale_price
        wholesale_quantity
        amount
        sale_price
      }
    }
    }
}
`

export const GET_ORDER_GROUP_HISTORY = gql`
query GetOrderGroupHistory($id: uuid!) {
  order_group: order_group_by_pk(id: $id) {
    id
    code
    created
    order_group_status {
      index
      name
      code
    }
    orders {
      id
      code
      created
      created_by
      account {
        full_name
        medium {
          name
          url
        }
      }
    }
  }
}
`;

export const GET_APP_CONFIG = gql`
  query GetAppConfig {
    appconfig {
      key
      value
    }
  }
`;
