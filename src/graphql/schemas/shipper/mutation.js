
import { gql } from '@apollo/client';

export const CREATE_SHIPPER = gql`
mutation CreateShipper($data: CreateShipperInput!) {
    createShipper(data: $data) {
      success
      error_code
      error_message
      shipperByShipper {
        id
        code
      }
    }
  }
  
`;

export const UPDATE_SHIPPER = gql`
  mutation UpdateShipper($data: UpdateShipperInput!) {
    updateShipper(data: $data) {
      success
      error_code
      error_message
      shipperByShipper {
        id
        code
      }
    }
  }
`;

export const DELETE_SHIPPER = gql`
mutation DeleteShipper($ids: [uuid!]) {
  deleteShipper(ids: $ids) {
    success
    error_code
    error_message
  }
}


`