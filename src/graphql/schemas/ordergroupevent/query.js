import gql from "graphql-tag";


export const GET_LIST_ORDER_GROUP_EVENT = gql`
query GetOrderGroupEvents($where: order_group_event_bool_exp!, $skip: Int!, $take: Int!) {
    total: order_group_event_aggregate(where: $where) {
        aggregate {
          count
        }
    }
    order_group_event(order_by: {created:desc}, where: $where,offset: $skip, limit: $take) {
      id
      event_status_code
      code
      order_min_price
      total_order_min_price
      total_participates
      total_order_number
      time_next_group
      group_timeline
      start_time
      end_time
    }
} 
`;


export const GET_ORDER_GROUP_EVENT_DETAIL = gql`
query GetOrderGroupByEvent($where: order_group_bool_exp!, $skip: Int!, $take: Int!) {
    total: order_group_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    order_group(order_by: {code: asc}, where:$where,offset: $skip, limit: $take) {
      order_group_status {
        code
        name
      }
      id
      event_status_code
      code
      start_time
      end_time
      current_total_order_number
      current_total_order_price
      current_total_participates
      order_min_price
      created
      order_group_event {
        group_timeline
        time_next_group
      }
    }
  }
`;

export const GET_ORDER_GROUP_EVENT_DETAIL_BY_ID = gql`
query GetOrderGroupByEvent($orderGroupEventId: uuid!) {
  order_group_event(order_by: {code: asc}, where: {id: {_eq: $orderGroupEventId}, deleted: {_eq: false}}) {
       id
      event_status_code
      code
      order_min_price
      total_order_min_price
      total_participates
      total_order_number
      time_next_group
      group_timeline
      start_time
      end_time
  }
}
`