import { useMutation, useQuery } from '@apollo/client';
import { GET_UNIT_LIST, GET_PRODUCT_STATUS } from '../../graphql/schemas/product/query';
import { CREATE_PRODUCT } from '../../graphql/schemas/product/mutation';
import { notification } from 'antd';

export const useGetUnits = () => {
    const { data, loading, error } = useQuery(GET_UNIT_LIST);

    return {
        data,
        loading,
        error
    }
}

export const useGetStatusProduct = () => {
    const { data, loading, error } = useQuery(GET_PRODUCT_STATUS);

    return {
        data,
        loading,
        error
    }
}

export const useCreateProduct = (history, setSuccessModal) => {
    const [handleCreateProduct, { loading, error }] = useMutation(CREATE_PRODUCT, {
        onCompleted: () => {
            setSuccessModal(true);
        },
        onError: (err) => {
            notification['error']({
                message: 'Sản phẩm',
                description:
                    'Tạo sản phẩm thất bại.',
            });
        },

    });

    return {
        handleCreateProduct,
        loading,
        error
    }
}