import { GET_ATTENDANCE_SHIPPER, GET_LIST_SHIPPER_STATUS, GET_LIST_SHIPPER_STATUS_HISTORY, GET_SHIPPER_REPORT_ACTIVITY, GET_SHIPPER_REPORT_ACTIVITY_OUT_OF_AREA, GET_SHIPPER_STATUS_RECORD } from "../../graphql/schemas/shipper/query";
import { useLazyQuery, useQuery } from '@apollo/client';
import _ from "lodash";

import moment from "moment";
import { GET_ORDER_LIST_HISTORY_EXPORT, GET_ORDER_LIST_SHIPPER_HISTORY } from "../../graphql/schemas/order/query";

export const useGetListAttendance = ({ shipper, from_date, to_date, skip, take }) => {
    const { data, loading, error } = useQuery(GET_ATTENDANCE_SHIPPER, {
        variables: {
            shipper,
            date_from: moment(from_date).startOf('day'),
            date_to: moment(to_date).endOf('day'),
            skip,
            take
        },
        skip: !shipper
    });

    return {
        data: _.get(data, "search_shipper_work_shift_history"),
        loading,
        error,
        count: _.get(data, 'total.aggregate.count')
    }
}

export const useGetShipperStatistical = ({ skip, take, id, from_date, to_date }) => {
    const { data, loading, error } = useQuery(GET_SHIPPER_REPORT_ACTIVITY, {
        variables: {
            id,
            from_date: moment(from_date).startOf('day'),
            to_date: moment(to_date).endOf('day')
        },
        skip: !id
    });

    return {
        data,
        total: _.get(data, 'total_out_of_area.aggregate.count'),
        loading,
        error
    }
};

export const useGetShipperOutOfArea = ({ skip, take, id, from_date, to_date }) => {
    const { data, loading, error } = useQuery(GET_SHIPPER_REPORT_ACTIVITY_OUT_OF_AREA, {
        variables: {
            id,
            skip,
            take,
            from_date: moment(from_date).startOf('day'),
            to_date: moment(to_date).endOf('day')
        }
    });

    return {
        data: _.get(data, 'out_of_area'),
        total: _.get(data, 'total_out_of_area.aggregate.count'),
        loading,
        error
    }
}

export const useGetListShipperStatus = () => {
    const { data, error, loading } = useQuery(GET_LIST_SHIPPER_STATUS);

    return {
        data: _.get(data, 'results'),
        error,
        loading
    }
}

export const useGetListOrderHistory = ({ skip, take, shipper, from_date, to_date, shipperWarningStatus }) => {
    const status = !_.isEmpty(shipperWarningStatus) ? {
        shipperWarningStatus: {
            code: {
                _in: shipperWarningStatus
            }
        }
    } : undefined
    const created = (from_date || to_date) ? {
        created: {
            _gte: from_date,
            _lte: to_date
        }
    } : undefined
    const { data, loading, error } = useQuery(GET_ORDER_LIST_SHIPPER_HISTORY, {
        variables: {
            skip,
            take,
            where: {
                shipper: { _eq: shipper },
                ...status,
                orderByOrder: {
                    order_status_record: {
                        ...created
                    }
                }
            }
        },
        skip: !shipper
    });

    return { data: _.get(data, 'result'), loading, error, total: _.get(data, 'total.aggregate.count') }
}

export const useGetListOrderHistoryExport = ({ shipper }) => {
    const { loading, data } = useQuery(GET_ORDER_LIST_HISTORY_EXPORT, {
        variables: {
            where: {
                shipper: { _eq: shipper }
            }
        }
    });

    return { data: _.get(data, 'result') }
}

export const useGetListStatusHistory = () => {
    const { data, loading, error } = useQuery(GET_LIST_SHIPPER_STATUS_HISTORY);

    return {
        data: _.get(data, 'result'),
        loading,
        error
    }
}

export const useGetShipperStatusRecord = ({ shipper, from_date, to_date, skip, take }) => {
    const { data, loading, error } = useQuery(GET_SHIPPER_STATUS_RECORD, {
        variables: {
            skip,
            take,
            shipper: shipper,
            date_from: moment(from_date).startOf('day'),
            date_to: moment(to_date).endOf('day')
        },
        skip: !shipper
    });

    return {
        data: _.get(data, "result", []),
        loading,
        error,
        count: _.floor(_.get(data, 'shipper_status_record_aggregate.aggregate.count', 0) * 1 / 2)
    }
}