import { gql } from "@apollo/client";

export const GET_UNIT_LIST = gql`
  query GetUnit {
    unit {
      id
      name
    }
  }
`;

export const GET_CATEGORIES_LIST = gql`
  query GetCategories {
    category(order_by: {index: asc}, where: {deleted: {_eq: false}, active: {_eq: true}}) {
      id
      code
      name
      category_units(order_by: {index: asc}, where: {unitByUnit: {deleted: {_eq: false}}}) {
        unitByUnit {
          id
          code
          name
        }
      }
    }
  }
`;

export const GET_PRODUCT_STATUS = gql`
  query GetProductStatus {
    product_status {
      id
      code
      name
    }
  }
`;

export const GET_PRODUCT_LIST = gql`
  query GetProducts($where: product_bool_exp!, $skip: Int!, $take: Int!) {
    total: product_aggregate(where: $where) {
      aggregate {
        count
      }
    }
    product(order_by: {created:desc}, where: $where,offset: $skip, limit: $take) {    
      id
      name
      price
      wholesale_price
      product_status {
        code
        name
      }
      medium {
        name
        id
        url
      }
      categoryByCategory {
        id
        code
        name
      }
    }
  }
`;

export const GET_PRODUCT_DETAIL = gql`
  query GetProduct($productId: uuid!) {
    product(where: { id: { _eq: $productId } }) {
      id
      code
      name
      description
      price
      wholesale_price
      wholesale_quantity
      only_booth
      categoryByCategory {
        id
        code
        name
      }
      medium {
        id
        name
        url
      }
      product_status {
        id
        code
        name
      }
      unitByUnit {
        id
        code
        name
      }
      product_pricings(order_by:{index:asc}, where: {deleted: {_eq: false}}) {
        active
        id
        product_type {
          id
          name
          medium {
            id
            name
            url
          }
        }
        product_sku {
          sku
        }
        package
        price
        wholesale_price
        wholesale_quantity
      }
    }
  }
`;

export const GET_WHOLESALE = gql`
query MyQuery {
  appconfig(where: {key: {_eq: "WHOLESALE_ENABLE"}}) {
    description
    value
    key
  }
}
`