
import { gql } from '@apollo/client';
import { CORE_SCHEMA_FIELDS } from '../core/fragment';

export const GET_LIST_BOOTHS = gql`
query getListBooths($where: booth_bool_exp!) {
    results: booth(where: $where) {
      id  
      code
      name
    }
  }
`;

export const GET_LIST_STATUS_SHIPPER = gql`
query getListWarningStatus {
  results:shipper_status (where: { deleted: { _eq: false } }) {
    id
    code
    name
  }
}

`

export const GET_LIST_SHIPPER = gql`
 query getShippers($take: Int!, $skip: Int!, $where: shipper_bool_exp!) {
    result: shipper(order_by: { code: desc }, offset: $skip, limit: $take, where: $where) {
          id 
          code ,
          full_name
          license_plate
          work_shifts:shipper_work_shifts(where: { deleted: { _eq: false } }) {
            id
            shift_time_from
            shift_time_to
          }
          avatar: medium {
            id 
            url
          }
          phone
          personalid
          shipper_status {
            id
            code
            name
          }
          rating_reviews(where: { deleted: { _eq: false } }) {
            star
          }
          booth_shippers (where: { boothByBooth: { deleted: { _eq: false } }, deleted: { _eq: false } }) {
            boothByBooth {
              id
              name
              code
              deleted
          }
        }
        
    }
    total: shipper_aggregate(where:$where) {
          aggregate {
            count
        }
      }
  }
`;

export const GET_SHIPPER_BY_FILTER = gql`
query getShipper($where: shipper_bool_exp!) {
  result: shipper(where: $where) {
    id 
    code 
    full_name
    license_plate
    status
    work_shifts:shipper_work_shifts(where: { deleted: { _eq: false } }) {
      id
      shift_time_from
      shift_time_to
    } 
    avatar: medium {
      id
      url
    }
    phone
    personalid
    rating_reviews(where: { deleted: { _eq: false } }) {
     	star
    }
  	booth_shippers (where: { boothByBooth: { deleted: { _eq: false } }, deleted: { _eq: false } }) {
      boothByBooth {
        id
        name
        code
        deleted
      }
    }
  }
}
`

export const GET_CHECK_EXIST_BOOTH = gql`
query getBooth($searchText: String!) {
  results: booth (where:{ name: { _eq: $searchText }, deleted: { _eq: false } }) {
    id  
    code
  }
}
`;

export const GET_ATTENDANCE_SHIPPER = gql`
query GetShipperWorkShiftHistory($skip: Int!, $take: Int!, $date_from: date = "", $date_to: date = "", $shipper: uuid = "") {
  total: search_shipper_work_shift_history_aggregate( offset: $skip, limit: $take, args: {date_from: $date_from, date_to: $date_to, shipperid: $shipper}) {
    aggregate {
      count
    }
  }
  search_shipper_work_shift_history(args: {date_from: $date_from, date_to: $date_to, shipperid: $shipper}, order_by: {check_in: desc}) {
    shipperByShipper {
      code
      full_name
    }
    check_in
    check_out
  }
}


`;

export const GET_SHIPPER_REPORT_ACTIVITY = gql`
query GetShipperReportActivity($id: uuid, $from_date: timestamptz = "now", $to_date: timestamptz = "now") {
  total_shipment: shipment_aggregate(distinct_on: [order], where: {deleted: {_eq: false}, shipper: {_eq: $id}, shipment_status: {code: {_in: ["COMPLETE", "CANCEL", "RETURN"]}}, shipment_status_record: {created: {_gte: $from_date, _lte: $to_date}}}) {
    aggregate {
      count
    }
  }
  total_shipment_complete: shipment_aggregate(distinct_on: [order], where: {deleted: {_eq: false}, shipper: {_eq: $id}, end_time: {_gte: $from_date, _lte: $to_date}, shipment_status: {code: {_eq: "COMPLETE"}}}) {
    aggregate {
      count
    }
  }
  total_shipment_cancel: shipment_aggregate(distinct_on: [order], where: {deleted: {_eq: false}, shipper: {_eq: $id}, shipment_status_record: {created: {_gte: $from_date, _lte: $to_date}}, shipment_status: {code: {_eq: "CANCEL"}}}) {
    aggregate {
      count
    }
  }
  total_shipment_reject: shipment_aggregate(where: {deleted: {_eq: false}, shipper: {_eq: $id}, shipment_status_record: {created: {_gte: $from_date, _lte: $to_date}}, shipment_status: {code: {_in: ["REJECT", "EXPIRE"]}}}) {
    aggregate {
      count
    }
  }
  total_delay_delivery: shipment_aggregate(where: {deleted: {_eq: false}, shipper: {_eq: $id}, end_time: {_gte: $from_date, _lte: $to_date}, delay_delivery: {_gt: 0}}) {
    aggregate {
      count
    }
  }
  total_delay_gg_est: shipment_aggregate(where: {deleted: {_eq: false}, shipper: {_eq: $id}, end_time: {_gte: $from_date, _lte: $to_date}, delay_gg_est: {_gt: 0}, delay_delivery: {_eq: 0}}) {
    aggregate {
      count
    }
  }
  total_out_of_area: shipper_activity_aggregate(where: {deleted: {_eq: false}, shipper: {_eq: $id}, created: {_gte: $from_date, _lte: $to_date}, warning: {_eq: true}}) {
    aggregate {
      count
    }
  }
}
`;

export const GET_SHIPPER_REPORT_ACTIVITY_OUT_OF_AREA = gql`
query GetShipperReportActivityOutOfArea($id: uuid, $from_date: timestamptz = "now", $to_date: timestamptz = "now", $take: Int!, $skip: Int!) {
  total_out_of_area: shipper_activity_aggregate(where: {deleted: {_eq: false}, shipper: {_eq: $id}, created: {_gte: $from_date, _lte: $to_date}, warning: {_eq: true}}) {
    aggregate {
      count
    }
  }
  out_of_area: shipper_activity(order_by: { created: desc }, offset: $skip, limit: $take, where: {deleted: {_eq: false}, shipper: {_eq: $id}, created: {_gte: $from_date, _lte: $to_date}, warning: {_eq: true}}) {
    id 
    latitude 
    longitude
    created
  }
}
`

export const GET_ORDER_BY_SHIPPER = gql`
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
      order_group{
        id
        code
      }
      created
      shipments(limit: 1, order_by: {created: desc}) {
        shipperByShipper {
          id
          code
          shipper_status {
            code
            name
          }
          shipper_activity {
            warning
            status_code
            longitude
            latitude
          }
        }
      }
      order_type {
        name
      }
      address: addressByAddress {
        ...addressData
      }
    }
    
  }
`;

export const GET_LIST_SHIPPER_STATUS = gql`
query getListShipperStatus {
  results: shipper_warning_status {
    	index
    	code
    	name
  }
}

`;

export const GET_LIST_SHIPPER_STATUS_HISTORY = gql`
query GetOrderShipperStatusHistory {
  result: shipper_warning_status(where: {code: {_in: ["DELAY_DELIVERY", "DELAY_GG_EST", "COMPLETE", "CANCELLED"]}}) {
    index
    code
    name
  }
}
`;

export const GET_SHIPPER_STATUS_RECORD = gql`
query GetShipperStatusRecords($skip: Int = 0, $take: Int = 10, $shipper: uuid!, $date_from: timestamptz!, $date_to: timestamptz!) {
  shipper_status_record_aggregate(where: {shipper: {_eq: $shipper}, created: {_gte: $date_from, _lte: $date_to}}) {
    aggregate {
      count
    }
  }
  result: getShipperActivityHistory(args: {take: $take, skip: $skip, shipper: $shipper, date_from: $date_from, date_to: $date_to}) {
    shipper_status {
      code
      name
    }
    date
    start_time
    end_time
  }
}
`;

export const GET_SHIPPER_HISTORY_REVIEW = gql`
query GetOrderShipperRatingReviewHistory($skip: Int = 0, $take: Int = 10, $where: view_order_rating_review_history_bool_exp!) {
  result: view_order_rating_review_history(limit: $take, offset: $skip, where: $where) {
    order_code
    shipperWarningStatus {
      code
      name
    }
    created
    delivery_time
    customer_code
    review
    star
    note
  }
  total: view_order_rating_review_history_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}

`;

export const GET_SHIPPER_HISTORY_REVIEW_EXPORT = gql`
query GetOrderShipperRatingReviewHistory( $where: view_order_rating_review_history_bool_exp!) {
  result: view_order_rating_review_history(where: $where) {
    order_code
    shipperWarningStatus {
      code
      name
    }
    created
    delivery_time
    customer_code
    review
    star
    note
  }
}

`