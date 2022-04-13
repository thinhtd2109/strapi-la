import gql from "graphql-tag";


export const CREATE_ORDER_GROUP_EVENT = gql`
mutation CreateOrderGroupEvent($data: CreateOrderGroupEventInput!) {
    createOrderGroupEvent(data: $data) {
      success
      orderGroupEventByOrderGroupEvent {
        id
        name
        description
        start_time
        end_time
        order_min_price
        total_order_min_price
        group_timeline
          time_next_group
          total_participates
          total_order_number
      }
    }
  }
  
`

export const DELETE_ORDER_GROUP_EVENT = gql`
  mutation DeleteOrderGroupEvent($id: uuid!) {
    deleteOrderGroupEvent(id: $id) {
      success
    }
  }
`;

export const UPDATE_ORDER_GROUP_EVENT = gql`
mutation UpdateOrderGroupEvent($data: UpdateOrderGroupEventInput!) {
  updateOrderGroupEvent(data: $data) {
    success
    orderGroupEventByOrderGroupEvent {
      id
      name
      description
      start_time
      end_time
      order_min_price
      total_order_min_price
      group_timeline
        time_next_group
        total_participates
        total_order_number
    }
  }
}

`

export const PAUSE_EVENT = gql`
mutation StopOrderGroupEvent($id: uuid!) {
  stopOrderGroupEvent(id: $id) {
    success
  }
}

`