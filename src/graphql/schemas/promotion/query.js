import gql from "graphql-tag";

export const GET_PROMOTIONS_BY_TYPE_CODE = gql`
query GetPromotionsByTypeCode($code: String!) {
    result: promotion(order_by: {start_time: desc}, where: {promotion_type: {code: {_eq: $code}}, deleted: {_eq: false}}) {
      id
      name
      description
      start_time
      end_time
      promotion_type {
        id
        code
        name
      }
      promotion_booths(where: {boothByBooth: {deleted: {_eq: false}}}){
        boothByBooth{
        id
        code
        }
      }
    }
  }
  
`

export const GET_PRODUCT_PRICINGS = gql`
query GetProductPricings($where: product_pricing_bool_exp! = {}, $offset: Int, $limit: Int) {
    result: product_pricing(offset: $offset, limit: $limit,order_by: {product: asc, created: desc}, where: $where) {
      id
      price
      product_type {
        name
      }
      package
      productByProduct {
        code
        deleted
        name
        product_status {
          code
          name
        }
        photo: medium {
          url
        }
        categoryByCategory {
            id
            code
            name
          }
      }
    }
  }  
`

export const GET_PROMOTION = gql`
query GetPromotion($id: uuid!) {
  result: promotion_by_pk(id: $id) {
    id
    name
    description
    start_time
    end_time
    promotion_type {
      id
      code
      name
    }
    promotion_booths(where: {boothByBooth: {deleted: {_eq: false}}}){
      boothByBooth{
      id
      code
      }
    }
    banner
    banner_detail: medium {
      url
    }
    promotion_product_pricings {
      promotion
      product_pricing
      percent
      productPricingByProductPricing {
        id
        price
        product_type{
          name
        }
        package
        productByProduct {
          code
          name
          product_status {
            code
            name
          }
          photo: medium {
            url
          }
        }
      }
    }
  }
}
`