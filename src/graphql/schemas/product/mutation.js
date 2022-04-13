import { gql } from '@apollo/client';

export const CREATE_PRODUCT = gql`
    mutation CreateProduct($data: CreateProductInput!) {
        createProduct(args: $data) {
            id
            name
        }
    }
`;

export const UPDATE_PRODUCT = gql`
    mutation UpdateProduct($data: CreateProductInput!) {
        updateProduct(args: $data) {
            id
            name
        }
    }
`;

export const DELETE_PRODUCT = gql`
    mutation DeleteProduct($id: uuid!, $updated_by: uuid!) {
        update_product_by_pk(pk_columns: {id: $id}, _set: {deleted: true, updated: "now", updated_by: $updated_by}) {
            id
            name
        }
    }
`;
