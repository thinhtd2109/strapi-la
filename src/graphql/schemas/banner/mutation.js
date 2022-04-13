import gql from "graphql-tag";

export const DELETE_BANNER = gql`
mutation DeleteBanner($id: uuid!,$account: uuid!) {
    update_media(_set: {deleted: true, updated: "now()", updated_by: $account},where: {id: {_eq: $id}}) {
      affected_rows
      returning {
        id
      }
    }
}
`