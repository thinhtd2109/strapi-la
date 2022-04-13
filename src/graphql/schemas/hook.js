import * as _ from "lodash";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import {
  GET_CATEGORIES_LIST,
  GET_PRODUCT_DETAIL,
  GET_PRODUCT_LIST,
  GET_PRODUCT_STATUS,
  GET_UNIT_LIST,
} from "./product/query";
import { DELETE_PRODUCT, UPDATE_PRODUCT } from "./product/mutation";
import { notification } from "antd";
import { GET_CHECK_EXIST_BOOTH, GET_LIST_BOOTHS, GET_LIST_SHIPPER, GET_LIST_STATUS_SHIPPER, GET_SHIPPER_BY_FILTER, GET_SHIPPER_HISTORY_REVIEW, GET_SHIPPER_HISTORY_REVIEW_EXPORT } from './shipper/query';
import { CREATE_SHIPPER, UPDATE_SHIPPER, DELETE_SHIPPER } from './shipper/mutation';
import { GET_LIST_INFO_BOOTHS } from "./booths/query";

export const useGetProductList = ({ skip, take, filterStatus, filterType, searchContent }) => {
  const { data, loading, error, refetch } = useQuery(GET_PRODUCT_LIST, {
    variables: {
      skip,
      take,
      where: {
        status: { _in: filterStatus.length !== 0 ? filterStatus : undefined },
        category: { _in: filterType.length !== 0 ? filterType : undefined },
        _or: [{ name: { _ilike: `%${searchContent}%` } }, { code: { _ilike: `%${searchContent}%` } }],
        deleted: { _eq: false },
      }
    },
  });

  return {
    data: _.get(data, "product"),
    total: _.get(data, 'total.aggregate.count', 0),
    loading,
    error,
    refetch,
  };
};

export const useGetProductDetail = (productId) => {
  const { data, loading, error, refetch } = useQuery(GET_PRODUCT_DETAIL, {
    variables: {
      productId,
    },
    skip: !productId,
  });

  return {
    data: _.head(_.get(data, "product")),
    loading,
    error,
    refetch,
  };
};

export const useGetProductStatus = () => {
  const { data, loading, error } = useQuery(GET_PRODUCT_STATUS, {});

  return {
    data: _.get(data, "product_status"),
    loading,
    error,
  };
};

export const useGetCategories = () => {
  const { data, loading, error } = useQuery(GET_CATEGORIES_LIST, {});

  return {
    data: _.get(data, "category"),
    loading,
    error,
  };
};

export const useGetUnitList = () => {
  const { data, loading, error } = useQuery(GET_UNIT_LIST, {});

  return {
    data: _.get(data, "unit"),
    loading,
    error,
  };
};

export const useUpdateProduct = (setSuccessModal) => {
  const [actionUpdate, { loading, error }] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => {
      setSuccessModal(true);
    },
    onError: (err) => {
      notification["error"]({
        message: "Sản phẩm",
        description:
          "Cập nhật sản phẩm thất bại. Vui Lòng liên hệ người quản trị.",
      });
    },
  });

  return {
    actionUpdate,
    loading,
    error,
  };
};

export const useDeteleProduct = () => {
  const [actionDelete, { loading, error }] = useMutation(DELETE_PRODUCT, {
    onCompleted: () => { },
    onError: (err) => {
      notification["error"]({
        message: "Xoá sản phẩm",
        description: "Xoá sản phẩm thất bại. Vui Lòng liên hệ người quản trị.",
      });
    },
  });

  return {
    actionDelete,
    loading,
    error,
  };
};


export const useGetListBooths = () => {
  const { data, loading, error } = useQuery(GET_LIST_BOOTHS, {
    variables: {
      where: {
        deleted: {
          _eq: false
        }
      }
    }
  });

  return {
    data: _.get(data, 'results'),
    loading,
    error
  }
}

export const useCreateShipper = () => {
  const [createShipper, { loading }] = useMutation(CREATE_SHIPPER);
  return {
    createShipper, loading
  };
}

export const useGetListStatusShipper = () => {
  const { data, loading } = useQuery(GET_LIST_STATUS_SHIPPER);

  return { loading, data: _.get(data, 'results') }
}

export const useGetListShipper = ({ skip, take, searchText, shipperStatus }) => {
  const shipper_status = shipperStatus ? {
    shipper_status: {
      code: {
        _eq: shipperStatus
      }
    }
  } : "";
  const { data, loading, error, refetch } = useQuery(GET_LIST_SHIPPER, {
    variables: {
      where: {
        ...shipper_status,
        deleted: { _eq: false },
        _or: [
          {
            code: { _ilike: `%${searchText}%` }
          },
          {
            full_name: { _ilike: `%${searchText}%` }
          },
          {
            license_plate: { _ilike: `%${searchText}%` }
          },
          {
            phone: { _ilike: `%${searchText}%` }
          },
          {
            personalid: { _ilike: `%${searchText}%` }
          },
          {
            booth_shippers: {
              boothByBooth: {
                code: {
                  _ilike: `%${searchText}%`
                }
              }
            }
          }
        ]
      },
      skip,
      take
    },
    fetchPolicy: 'no-cache'
  });

  return { data: _.get(data, 'result'), loading, error, count: _.get(data, 'total.aggregate.count'), refetch }
}

export const useGetShipper = ({ id }) => {
  const { data, loading, error, refetch } = useQuery(GET_SHIPPER_BY_FILTER, {
    variables: {
      where: {
        id: { _eq: id }
      }
    },
    skip: !id
  });

  return { data: _.get(data, 'result[0]'), loading, error, refetch }
};

export const useUpdateShipper = () => {
  const [updateShipper] = useMutation(UPDATE_SHIPPER);
  return updateShipper;
}
export const useDeleteShipper = () => {
  const [deleteShipper] = useMutation(DELETE_SHIPPER);
  return deleteShipper;
}

export const useGetBoothExist = ({ searchText }) => {
  const { data } = useQuery(GET_CHECK_EXIST_BOOTH, {
    variables: {
      searchText
    },
    skip: !searchText
  });

  return _.get(data, 'results[0]');
};

export const useGetListInfoBooths = ({ booths }) => {
  const { data, loading, error } = useQuery(GET_LIST_INFO_BOOTHS, {
    variables: {
      codes: booths
    }
  });

  return {
    data: _.get(data, 'results'),
    loading,
    error
  }
}

export const useGetListHistoryReview = ({ skip, take, shipper, date_from, date_to, status_code }) => {
  const statusCode = !_.isEmpty(status_code) ? {
    shipperWarningStatus: {
      code: {
        _in: status_code
      }
    }
  } : undefined;
  const { data, loading, error } = useQuery(GET_SHIPPER_HISTORY_REVIEW, {
    variables: {
      skip,
      take,
      where: {
        shipper: { _eq: shipper },
        ...statusCode,
        delivery_time: {
          _gte: date_from,
          _lte: date_to
        }
      }
    },
    skip: !shipper
  });

  return {
    data: _.get(data, 'result'), loading, error, total: _.get(data, 'total.aggregate.count')
  }


};

export const useGetListHistoryReviewExport = ({ shipper }) => {
  const { data, loading, error } = useQuery(GET_SHIPPER_HISTORY_REVIEW_EXPORT, {
    variables: {
      where: {
        shipper: {
          _eq: shipper
        }
      }
    },
    skip: !shipper
  });

  return {
    data: _.get(data, 'result'), loading, error
  }
}