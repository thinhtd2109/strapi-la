import { useMutation, useQuery } from '@apollo/client';
import _ from 'lodash';
import { DELETE_ORDER_GROUP_EVENT, PAUSE_EVENT, UPDATE_ORDER_GROUP_EVENT } from '../../graphql/schemas/ordergroupevent/mutation';
import { GET_LIST_ORDER_GROUP_EVENT, GET_ORDER_GROUP_EVENT_DETAIL, GET_ORDER_GROUP_EVENT_DETAIL_BY_ID } from '../../graphql/schemas/ordergroupevent/query';

export const useGetListEventOrderGroup = ({ take, where = {}, skip }) => {
    const { data, loading, refetch } = useQuery(GET_LIST_ORDER_GROUP_EVENT, {
        variables: {
            skip,
            take,
            where
        },
        fetchPolicy: 'no-cache'
    });

    return {
        data: _.get(data, 'order_group_event'),
        loading,
        total: _.get(data, 'total.aggregate.count'),
        refetch
    }
}

export const useDeleteOrderGroupEvent = () => {
    const [deleteOrderGroupEvent] = useMutation(DELETE_ORDER_GROUP_EVENT);

    return deleteOrderGroupEvent;
}

export const useGetDetailOrderGroupEventById = ({ id }) => {
    const { data, loading, error } = useQuery(GET_ORDER_GROUP_EVENT_DETAIL_BY_ID, {
        variables: {
            orderGroupEventId: id
        },
        skip: !id
    });

    return {
        data: _.get(data, 'order_group_event[0]'),
        loading,
        error
    }
}

export const useGetDetailOrderGroupEvent = ({ id, searchText, skip, take }) => {
    const { data, loading, error } = useQuery(GET_ORDER_GROUP_EVENT_DETAIL, {
        variables: {
            skip,
            take,
            where: {
                event: { _eq: id },
                deleted: { _eq: false },
                code: { _ilike: `%${searchText}%` }
            }
        },
        skip: !id
    });

    return {
        total: _.get(data, 'total.aggregate.count'),
        data: _.get(data, 'order_group'),
        loading,
        error
    }
}

export const useUpdateDetailOrderGroupEvent = () => {
    const [updateOrderGroupEvent] = useMutation(UPDATE_ORDER_GROUP_EVENT);

    return updateOrderGroupEvent;
}

export const usePauseEvent = () => {
    const [pauseEvent] = useMutation(PAUSE_EVENT);

    return pauseEvent;
}