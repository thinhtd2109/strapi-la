import { useMutation, useQuery } from "@apollo/client"
import _ from "lodash";
import { CREATE_ARTICLE, DELETE_ARTICLE } from "../../../graphql/schemas/articles/category/mutation";
import { GET_CATEGORY_LIST } from "../../../graphql/schemas/articles/category/query"

export const useGetCategories = ({ filter }) => {
    const { data, loading, refetch } = useQuery(GET_CATEGORY_LIST, {
        variables: {
            filter: filter
        },
        fetchPolicy: 'no-cache'
    });

    return {
        data: _.get(data, 'result'),
        loading,
        refetch
    }
}

export const useCreateCategory = () => {
    const [create] = useMutation(CREATE_ARTICLE);

    return create;
}

export const useDeleteCategory = () => {
    const [deleteFunc] = useMutation(DELETE_ARTICLE);

    return deleteFunc;
}