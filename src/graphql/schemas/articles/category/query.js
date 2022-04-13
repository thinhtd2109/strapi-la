import { gql } from '@apollo/client';

export const GET_CATEGORY_LIST = gql`
query articleCategories($filter: ArticleCategoryFiltersInput) {
  result: articleCategories(filters: $filter) {
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