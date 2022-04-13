import { gql } from "@apollo/client";

export const CORE_SCHEMA_FIELDS = gql`
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
`;


const PRODUCT_FRAGMENT = gql`
fragment ProductFragment on product {
  id
  code
  name
  photo: medium {
    url
  }
  status
  vendor
  active
  deleted
}
`
export const PRODUCT_PRICING_FRAGMENT = gql`
${PRODUCT_FRAGMENT}
fragment ProductPricingFragment on product_pricing {
  id
  active
  deleted
  product_detail: productByProduct {
    ...ProductFragment
  }
  type_detail: product_type {
    id
    name
  }
  attributes_detail: product_type_attribute {
    id
    name
  }
  sku_detail: product_sku {
    id
    sku
  }
  unit_detail: unitByUnit {
    id
    name
  }
  package
  price
  sale_price
  wholesale_price
  wholesale_quantity
}
`

export const ORDER_ITEM_FRAGMENT = gql`
fragment orderItemFragment on order_item {
  productByProduct {
    id
    code
    name
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
  package
  quantity
  price
  sale_price
  wholesale_price
  wholesale_quantity
  amount
}
`

export const ORDER_BOOTH_ITEM_FRAGMENT = gql`
${ORDER_ITEM_FRAGMENT}
fragment orderBoothItemFragment on order_booth_item {
  quantity
  orderItemByOrderItem {
    ...orderItemFragment
  }
}
`