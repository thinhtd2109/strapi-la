import gql from "graphql-tag";


export const CREATE_PROMOTION = gql`
mutation CreatePromotion($arg: PromotionInput!) {
    result: createPromotion(arg: $arg) {
      id
      code
      name
      promotion_type {
        id
        code
        name
      }
    }
  }  
`
export const EDIT_PROMOTION = gql`
mutation UpdatePromotion($arg: PromotionInput!) {
  result: updatePromotion(arg: $arg) {
    id
    code
    name
    promotion_type {
      id
      code
      name
    }
  }
}

`

export const DELETE_PROMOTION = gql`
mutation DeletePromotionById($id: uuid!, $updated_by: uuid!) {
  update_promotion_by_pk(pk_columns: {id: $id}, _set: {deleted: true, updated: "now", updated_by: $updated_by}) {
    id
  }
}
`