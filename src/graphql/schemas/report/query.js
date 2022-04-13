import { gql } from "@apollo/client";
import {
  ORDER_BOOTH_ITEM_FRAGMENT,
  ORDER_ITEM_FRAGMENT,
} from "../core/fragment";

export const GET_LIST_REPORT_SHIPPER_EXPORT = gql`
query GetReportShipper($where: shipper_work_shift_record_bool_exp!) {
  total: shipper_work_shift_record_aggregate(where: $where) {
    aggregate {
      count
    }
  }
  result: shipper_work_shift_record(order_by: {shipperByShipper: {code: asc}, created: desc}, where:$where) {
    shift_time_from
    shift_time_to
    check_in
    check_out
    created
    shipper:shipperByShipper {
      id
      code
      full_name
      license_plate
      phone
      shipper_status {
        id 
        code
      }
      shipper_work_shifts {
        shift_time_from 
        shift_time_to
      }
      rating_reviews_aggregate(where: {deleted: {_eq: false}}) {
        aggregate {
          avg {
            star
          }
        }
      }
      booth_shippers(where: { deleted: { _eq: false } }) {
        boothByBooth {
          id
          code
        }
      }
    }
  }
}
`

export const GET_LIST_REPORT_SHIPPER = gql`
query GetReportShipper($from_date_star: timestamptz = "now", $to_date_star: timestamptz = "now", $take: Int = 20, $skip: Int = 0, $where: shipper_work_shift_record_bool_exp!) {
  total: shipper_work_shift_record_aggregate(where: $where) {
    aggregate {
      count
    }
  }
  result: shipper_work_shift_record(limit: $take, offset: $skip, order_by: {shipperByShipper: {code: asc}, created: desc}, where:$where) {
    shift_time_from
    shift_time_to
    check_in
    check_out
    created
    shipper:shipperByShipper {
      id
      code
      full_name
      license_plate
      phone
      shipper_status {
        id 
        code
      }
      shipper_work_shifts {
        shift_time_from 
        shift_time_to
      }
      rating_reviews_aggregate(where: {deleted: {_eq: false}, created: {_gte: $from_date_star, _lte: $to_date_star}}) {
        aggregate {
          avg {
            star
          }
        }
      }
      booth_shippers(where: { deleted: { _eq: false } }) {
        boothByBooth {
          id
          code
        }
      }
    }
  }
}
`

export const GET_LIST_REPORT_SALES = gql`
  ${ORDER_BOOTH_ITEM_FRAGMENT}
  ${ORDER_ITEM_FRAGMENT}
  query GetSaleReports($where: order_bool_exp!) {
    order(order_by: { code: desc }, where: $where) {
      id
      code
      status
      created
      order_status_record {
        id
        created
      }
      paymentMethodByPaymentMethod {
        id
        code
        name
      }
      order_status {
        code
        name
        id
        index
      }
      order_group {
        id
        code
      }
      order_booths {
        boothByBooth {
          id
          code
        }
        order_booth_items {
          ...orderBoothItemFragment
        }
      }
      order_items {
        ...orderItemFragment
      }
      account {
        id
        code
      }
      addressByAddress {
        wardByWard {
          id
          name
        }
        districtByDistrict {
          id
          name
        }
      }
      promotionComboByPromotionCombo {
        code
        name
        promotion_type {
          code
        }
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
      payments(where: { deleted: { _eq: false } }) {
        code
        amount
        payment_method {
          code
          name
        }
        voucherByVoucher {
          code
        }
      }
      order_type {
        name
      }
      shipments(
        order_by: { created: desc }
        limit: 1
        where: { deleted: { _eq: false } }
      ) {
        shipperByShipper {
          id
          code
        }
      }
    }
  }
`;

export const GET_LIST_REPORT_SUMMARY = gql`
  query GetProductReports($where: order_bool_exp!) {
    product_type(where: { order_items: { orderByOrder: $where } }) {
      name
      productByProduct {
        id
        code
        name
        unitByUnit {
          name
        }
      }
      total_order: order_items_aggregate(where: { orderByOrder: $where }) {
        aggregate {
          count
        }
      }
      order_last_time: order_items(
        limit: 1
        order_by: { created: desc }
        where: { orderByOrder: $where }
      ) {
        orderByOrder {
          order_status {
            id
            name
            index
            code
          }
          created
        }
        product_sku {
          sku
        }
      }
    }
  }
`;
export const GET_LIST_REPORT_EXPORT = gql`
  query GetSaleProductInventories($where: order_item_bool_exp! = {}) {
    order_item(where: $where) {
      product
      type
      package
      sku
      sale_price
      product_type {
        name
      }
      product_sku {
        sku
      }
      productByProduct {
        id
        code
        name
        price
        unitByUnit {
          name
        }
        categoryByCategory {
          name
        }
      }
      orderByOrder {
        addressByAddress {
          wardByWard {
            id
            name
          }
          districtByDistrict {
            id
            name
          }
        }
      }
      quantity
    }
  }
`;

export const GET_LIST_REPORT_PRODUCT = gql`
  query GetProductInventories(
    $where: product_pricing_bool_exp! = {}
    $argDate: sale_count_product_pricing_args! = {}
  ) {
    product_pricing(order_by: { created: asc }, where: $where) {
      price
      wholesale_price
      product_type {
        name
      }
      product_sku {
        sku
      }
      productByProduct {
        id
        code
        name
        unitByUnit {
          name
        }
        product_status {
          id
          code
          name
        }
        categoryByCategory {
          name
        }
      }
      sale_count(args: $argDate)
    }
  }
`;

export const GET_LIST_REPORT_SALES_WITH_BOOTH = gql`
  ${ORDER_BOOTH_ITEM_FRAGMENT}
  ${ORDER_ITEM_FRAGMENT}
  query GetSaleReports(
    $where: order_bool_exp!
    $orderBoothWhere: order_booth_bool_exp = {}
  ) {
    order(order_by: { code: desc }, where: $where) {
      id
      code
      status
      created
      order_status_record {
        id
        created
      }
      paymentMethodByPaymentMethod {
        id
        code
        name
      }
      order_status {
        code
        name
        id
        index
      }
      order_group {
        id
        code
      }
      order_booths(where: $orderBoothWhere) {
        boothByBooth {
          id
          code
        }
        order_booth_items {
          ...orderBoothItemFragment
        }
      }
      order_items {
        ...orderItemFragment
      }
      account {
        id
        code
      }
      addressByAddress {
        wardByWard {
          id
          name
        }
        districtByDistrict {
          id
          name
        }
      }
      promotionComboByPromotionCombo {
        code
        name
        promotion_type {
          code
        }
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
      payments(where: { deleted: { _eq: false } }) {
        code
        amount
        payment_method {
          code
          name
        }
        voucherByVoucher {
          code
        }
      }
      order_type {
        name
      }
      shipments(
        order_by: { created: desc }
        limit: 1
        where: { deleted: { _eq: false } }
      ) {
        shipperByShipper {
          id
          code
        }
      }
    }
  }
`;
