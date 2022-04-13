
import { gql } from '@apollo/client';
import { PRODUCT_PRICING_FRAGMENT } from "../core/fragment";

export const GET_LIST_BOOTHS = gql`
   query getListBooth($where: booth_bool_exp!, $skip: Int!, $take: Int!) {
    total: booth_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    results: booth(where: $where, offset: $skip, limit: $take, order_by: {created: desc}) {
      id  
      code  
      name
      active
      booth_incharges(where: {deleted: {_eq: false}}) {
        province: provinceByProvince {
          id  
          name
        }
        district: districtByDistrict {
          id  
          name
        }
        ward: wardByWard {
          id  
          name
        }
      }
      booth_accounts(where: { deleted: { _eq: false } }) {
        account: accountByAccount {
          phone
        }
      }
    }
  }
`;

export const GET_LIST_BOOTHS_FILTER = gql`
query GetAllBooths {
  results: booth(where: {deleted: {_eq: false}}) {
    id
    code
  }
}
`

export const GET_BOOTHS_BY = gql`
   query getListBooth($where: booth_bool_exp!) {
    total: booth_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    results: booth(where: $where) {
      id  
      code  
      name
      booth_shippers {
        shipper: shipperByShipper {
        	id  
          code  
          full_name
          license_plate
        }
      }
      booth_incharges(where: { deleted: { _eq: false } }) {
        province: provinceByProvince {
          id  
          name
        }
        district: districtByDistrict {
          id  
          name
        }
        ward: wardByWard {
          id  
          name
        }
      }
      booth_accounts(where: { deleted: { _eq: false } }) {
        account: accountByAccount {
          phone
        }
      }
    }
  }
`

export const GET_BOOTH_PRODUCT_FOR_IMPORT = gql`
${PRODUCT_PRICING_FRAGMENT}
query GetBoothProductForImport($skus: [String!] = []) {
  result: product_pricing(where: {productByProduct: {deleted: {_eq: false}}, product_sku: {_and: [{sku: {_neq: ""}}, {sku: {_in: $skus}}]}, deleted: {_eq: false}}) {
    ...ProductPricingFragment
  }
}
`



export const GET_BOOTH_PRODUCT_LIST = gql`
query GetBoothProductList($skip: Int = 0, $take: Int = 300000, $boothId: uuid!) {
  booth_product_aggregate(where: {deleted: {_eq: false}, booth: {_eq: $boothId}}) {
    aggregate {
      count
    }
  }
  booth_product(limit: $take, offset: $skip, where: {deleted: {_eq: false}, booth: {_eq: $boothId}}) {
    stock # Tổng SL sau khi nhập
    booth_order_item {
      quantity # SL nhập
      created # Ngày nhập
    }
    productPricingByProductPricing {
      productByProduct {
        code
        name
        photo: medium {
          url
        }
        unitByUnit {
          name
        }
      }
      product_type {
        name
      }
      product_sku {
        sku
      }
      id
      package
      price
    }
  }
}
`
export const GET_LIST_INFO_BOOTHS = gql`
query GetBoothIncharges($codes: [String!] = []) {
  results: booth(where: { code: { _in: $codes } }) {
    id 
    code
  	booth_incharges(where: {deleted: {_eq: false}}) {
      district: districtByDistrict {
        id
      name
    }
    ward: wardByWard {
      id
      name
    }
    }
  }
}
`