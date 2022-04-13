import { gql } from '@apollo/client';

export const CREATE_BOOTHS = gql`
    mutation CreateBooth($data: CreateBoothInput!) {
    createBooth(data: $data) {
        success
        boothByBooth {
        id
        code
        }
    }
    }

`

export const DELETE_BOOTHS = gql`
mutation DeleteBooth($id: uuid!) {
  deleteBooth(id: $id) {
    success
  }
}

`;

export const UPDATE_BOOTHS = gql`
mutation UpdateBooth($data: UpdateBoothInput!) {
  updateBooth(data: $data) {
    success
    boothByBooth {
      id
      code
    }
  }
}

`

export const IMPORT_BOOTH_PRODUCT = gql`
mutation ImportBoothProduct($data: ImportBoothInput!) {
  importBoothProduct(data: $data) {
    success
    affected_rows
  }
}
`