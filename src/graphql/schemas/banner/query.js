import gql from "graphql-tag";


export const GET_LIST_BANNER = gql`
query getBanners {
    media(order_by: {index: asc}, where: {media_type: {code: {_eq: "BANNER"}}, deleted: {_eq: false}}) {
      id
      url
    }
  }
`
export const GET_BANNERS_BY_TYPE = gql`
query Banners($type: String) {
  media(order_by: {index: asc}, where: {deleted: {_eq: false}, media_type: {code: {_eq: $type}}}) {
    id
    url
    media_type{
      id
      code
    }
  }
}
`

export const GET_BANNER_PROMOTION = gql`
query Banners {
  media(order_by: {index: asc}, where: {deleted: {_eq: false}, media_type: {code: {_eq: "BANNER_PROMOTION"}}, _or: [{_not: {promotions: {}}}, {promotions: {deleted: {_eq: false}, _or: [{start_time: {_is_null: true}, end_time: {_is_null: true}}, {start_time: {_lte: "now"}, end_time: {_gte: "now"}}]}}]}) {
    id
    url
    media_type {
      id
      code
    }
  }
}
`

export const GET_BANNER_TYPES = gql`
query BannerTypes {
  media_type(order_by: {created: asc}, where: {deleted: {_eq: false}, code: {_like: "BANNER%"}}) {
    code
    name
  }
}
`