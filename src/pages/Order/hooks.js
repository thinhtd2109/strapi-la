import { useMutation, useQuery } from "@apollo/client"
import { PRINT_ORDER_UPDATE_COUNT } from "../../graphql/schemas/order/mutation"
import { GET_ORDER_LIST_SELECTION } from "../../graphql/schemas/order/query";
import _ from 'lodash'

export const useIncrementCountPrint = () => {
    const [incrementPrintCount] = useMutation(PRINT_ORDER_UPDATE_COUNT);

    return incrementPrintCount;
}

export const useGetListOrderSelect = (rowSelection) => {
    const { data, refetch, loading } = useQuery(GET_ORDER_LIST_SELECTION, {
        variables: {
            where: {
                deleted: {
                    _eq: false
                },
                id: {
                    _in: rowSelection
                }
            }

        },
        skip: !rowSelection
    });

    return {
        data: data?.order,
        refetch,
        loading
    };
}


