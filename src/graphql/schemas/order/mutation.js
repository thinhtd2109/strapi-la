import { gql } from "@apollo/client";

export const UPDATE_STATUS = gql`
    mutation UpdateOrderStatus($data: UpdateOrderStatusInput!) {
        updateOrderStatus(args: $data) {
        success
        }
    }
`;

export const UPDATE_GROUP_STATUS = gql`
    mutation UpdateOrderGroupStatus($data: UpdateOrderGroupStatusInput!) {
        updateOrderGroupStatus(args: $data) {
        success
        }
    }  
`;

export const UPDATE_LIST_ORDER_STATUS = gql`
    mutation UpdateListOrderStatus($data: UpdateListOrderStatusInput!) {
        updateListOrderStatus(args: $data) {
            success
        }
    }
`;

export const PRINT_ORDER_UPDATE_COUNT = gql`
    mutation PrintOrderUpdate($ids: [uuid!]!, $printBy: uuid!) {
        update_order(where: {id: {_in: $ids}}, _set: {print_last_time: "now", print_last_by: $printBy}) {
            affected_rows
        }
    }
`

export const UPDATE_BOOTH = gql`
mutation AllocateOrderBooth($order: uuid!, $booth: uuid) {
    result: allocateOrderBooth(order: $order, booth: $booth) {
        success
        error_code
        error_message
    }
}
`