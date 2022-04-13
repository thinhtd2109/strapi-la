import { gql } from "@apollo/client";

export const GET_DASHBOARD_SUMMARY = gql`
  query GetDashboardSummary($dateFrom: timestamptz!, $dateTo: timestamptz!) {
    revenue: order_aggregate(
      where: {
        order_status: { code: { _eq: "DELIVERED" } }
        _and: [
          { order_status_record: { created: { _gte: $dateFrom } } }
          { order_status_record: { created: { _lt: $dateTo } } }
        ]
      }
    ) {
      aggregate {
        sum {
          total_amount
        }
      }
    }
    order_count: order_aggregate(
      where: {
        order_status: { code: { _eq: "DELIVERED" } }
        _and: [
          { order_status_record: { created: { _gte: $dateFrom } } }
          { order_status_record: { created: { _lt: $dateTo } } }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
    product_count: product_aggregate(where: { deleted: { _eq: false } }) {
      aggregate {
        count
      }
    }
  }
`;

export const GET_DASHBOARD_CHART = gql`
  query GetDashboardChart($type: String!, $from: date!, $to: date!) {
    result: fn_order_statistic(
      args: { period_type: $type, date_from: $from, date_to: $to }
    ) {
      period_name
      total_amount
    }
  }
`;

export const GET_DASHBOARD_SHIPPER = gql`
  subscription GetDashboardShipper($take: Int!, $skip: Int!) {
    result: view_dashboard_shipper(offset: $skip, limit: $take, order_by: {shipper_warning_status: {index: asc}}) {
      id
      shipper_info: shipperByShipper {
        id
        code
        full_name
        phone
        license_plate
     
        shipper_status {
          id
          code
          name
        }
        booth_shippers(where: { deleted: { _eq: false } }) {
          boothByBooth {
            id
            code
            booth_incharges {
              province: provinceByProvince {
                name
              }
              district: districtByDistrict {
                name
              }
              ward: wardByWard {
                name
              }
            }
          }
        }
      }
      shipment: shipmentByShipment {
        order: orderByOrder {
          id
          code
        }
      }
      total_call_warning
      shipment_id
      warning_status
      shipper_warning_status {
        index
        code
        name
      }
    }
  }
`;

export const GET_COUNT_DASHBOARD_SHIPPER = gql`
  subscription getTotalDashboardShipper {
    result: view_dashboard_shipper_aggregate(order_by: {shipper_warning_status: {index: asc}}) {
      aggregate {
        count
      }
    }
  }
`;
