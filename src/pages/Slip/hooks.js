import { useMutation, useQuery } from "@apollo/client"
import { PRINT_ORDER_UPDATE_COUNT } from "../../graphql/schemas/order/mutation"
import { GET_ORDER_LIST_SELECTION } from "../../graphql/schemas/order/query";
import _ from 'lodash'
import { GET_BOOTH_PRODUCT_LIST } from '../../graphql/schemas/booths/query';
import { GET_LIST_ORDER_BOOTH, GET_LIST_STATUS_ORDER_BOOTH } from '../../graphql/schemas/order_booth/query';

import moment from "moment";
import { GET_ALL_BOOTH, GET_ALL_BOOTH_ORDERS } from "../../graphql/schemas/slip/query";
import { CREATE_BOOTH_ORDER, UPDATE_ORDER_STATUS } from "../../graphql/schemas/slip/mutation";
import { notification } from "antd";
import { useHistory } from "react-router-dom";
import slugs from "../../constant/slugs";


export const useGetAllBooth = () => {
    const { data, loading } = useQuery(GET_ALL_BOOTH);
    return {
        data: data?.booth,
        loading: loading
    }
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

export const useGetBoothProductList = ({ id }) => {
    const { data, loading } = useQuery(GET_BOOTH_PRODUCT_LIST, {
        variables: {
            boothId: id
        },
        skip: !id
    })
    return {
        data: _.get(data, 'booth_product'),
        loading
    }
}

export const useGetListBoothOrder = ({ searchContent, filterParams, pageSize, skip }) => {

    let where = {};
    let _or = [];
    let _and = [];

    if (!_.isEmpty(searchContent) && _.size(searchContent) >= 10 && searchContent[0] === '0') {
        searchContent = '+84' + _.join(_.slice(_.split(searchContent, ''), 1, 10), '')
    }

    if (searchContent) {
        _or.push({ code: { _ilike: `%${searchContent}%` } });
        _and.push({ boothByBooth: { _or: [{ code: { _ilike: `%${searchContent}%` } }, { name: { _ilike: `%${searchContent}%` } }, { booth_accounts: { accountByAccount: { phone: { _ilike: `%${searchContent}%` } } } }] } });
        if (_or["_and"]) {
            _or["_and"] = _and;
        }
        else {
            _or.push({ _and });
        }
        _.set(where, "_or", _or);
    } else {
        if (_and["boothByBooth"]) {
            delete _and["boothByBooth"];
        }

        if (_and["code"]) {
            delete _and["code"];
        }
    }

    if (!_.isEmpty(_.get(filterParams, 'status'))) {
        _and.push({ booth_order_status: { id: { _in: filterParams.status } } });
        if (_or["_and"]) {
            _or["_and"] = _and;
        } else {
            _or.push({ _and });
        }
        _.set(where, "_or", _or);
    } else {
        if (_and["booth_order_status"]) {
            delete _and["booth_order_status"]
        }
    }

    if (!_.isEmpty(_.get(filterParams, "type"))) {
        _and.push({ type: { _in: filterParams.type } });
        if (_or["_and"]) {
            _or["_and"] = _and;
        } else {
            _or.push({ _and });
        }
        _.set(where, "_or", _or);
    } else {
        if (_and['type']) {
            delete _and['type']
        }
    }

    if (_.isEmpty(_and)) {
        if (_or['_and']) {
            delete _or['_and'];
        }
    }

    if (!_.isEmpty(_or)) {
        _.set(where, "_or", _or);
    } else {
        delete where["_or"];
    }

    _.set(where, "created._gte", moment(filterParams.dateTime[0]));
    _.set(where, "created._lte", moment(filterParams.dateTime[1]));

    const { data, loading, error, refetch } = useQuery(GET_ALL_BOOTH_ORDERS, {
        variables: {
            take: pageSize,
            skip,
            where: {
                ...where,
                deleted: {
                    _eq: false
                }
            }
        },
        fetchPolicy: 'no-cache'
    })

    return {
        data: _.get(data, 'result'),
        loading,
        error,
        refetch,
        total: _.get(data, 'total.aggregate.count')
    }
}

export const useGetListBoothOrderGetAll = ({ code = {} }) => {
    const id = !_.isEmpty(code) ? { code: { _eq: code } } : undefined
    const { data } = useQuery(GET_ALL_BOOTH_ORDERS, {
        variables: {
            skip: 0,
            take: 1,
            where: {
                deleted: {
                    _eq: false
                },
                ...id
            }
        }
    });

    return {
        data: _.get(data, 'result[0]')
    }
}

export const useGetListStatusList = () => {
    const { data } = useQuery(GET_LIST_STATUS_ORDER_BOOTH);

    return _.get(data, 'results')
}

export const useCreateBoothOrder = () => {
    const history = useHistory();
    const [createBoothOrder, { data, loading, error }] = useMutation(CREATE_BOOTH_ORDER, {
        onCompleted: () => {
            notification["success"]({
                message: "Tạo phiếu nhập thành công",
            })
            history.push(slugs.slip);
        },
        onError: (err) => {
            let skuErrorList = _.split(_.get(err, 'message'), ';');
            notification["error"]({
                duration: 0,
                message: "Tạo phiếu nhập",
                description: _.map(skuErrorList, item => {
                    return <div>{item}</div>
                })
            });
        }
    });

    return {
        createBoothOrder,
        loading,
        error,
    };
}

export const useGetOrderBooth = ({ code, id }) => {
    const { data, loading, refetch } = useQuery(GET_LIST_ORDER_BOOTH, {
        variables: {
            booth: id,
            code
        }
    })

    return { data: _.get(data, 'booth_order[0]'), loading, refetch }

}

export const useUpdateOrderBoothStatus = () => {
    const [update] = useMutation(UPDATE_ORDER_STATUS);

    return update;
}