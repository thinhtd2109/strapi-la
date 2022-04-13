import { gql } from "@apollo/client";

export const CREATE_ARTICLE = gql`
mutation createArticleCategory($data: ArticleCategoryInput!) {
  result: createArticleCategory(data: $data) {
    data {
      id
      attributes {
        code
        name
        createdAt
        updatedAt
      }
    }
  }
}
`;

export const DELETE_ARTICLE = gql`
mutation deleteArticleCategory($id: ID!) {
  result: deleteArticleCategory(id: $id) {
    data {
      id
      attributes {
        code
        name
        createdAt
        updatedAt
      }
    }
  }
}
`