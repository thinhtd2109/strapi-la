import { useQuery } from "@apollo/client";
import {
  GET_LIST_REPORT_EXPORT,
  GET_LIST_REPORT_PRODUCT,
  GET_LIST_REPORT_SALES,
  GET_LIST_REPORT_SALES_WITH_BOOTH,
  GET_LIST_REPORT_SUMMARY,
  GET_LIST_REPORT_SHIPPER,
  GET_LIST_REPORT_SHIPPER_EXPORT
} from "../../graphql/schemas/report/query";
import _ from "lodash";

export const useGetListReportSales = (variables) => {
  const { data, loading } = useQuery(variables.orderBoothWhere ? GET_LIST_REPORT_SALES_WITH_BOOTH : GET_LIST_REPORT_SALES, {
    variables: variables
  });

  return { data, loading };
};

export const useGetListReportSummary = (variables) => {
  const { data, loading } = useQuery(GET_LIST_REPORT_SUMMARY, {
    variables,
  });

  return { data, loading };
};

export const useGetListReportExport = (variables) => {
  const { data, loading, refetch } = useQuery(GET_LIST_REPORT_EXPORT, {
    variables,
  });
  return { data, loading, refetch };
};

export const useGetListReportProduct = (variables) => {
  const { data, loading, refetch } = useQuery(GET_LIST_REPORT_PRODUCT, {
    variables,
  });
  return { data, loading, refetch };
};

export const useGetListReportShipper = ({ from_date, to_date, take, skip, shipper_status }) => {
  let tempShipperStatus = shipper_status ? {
    shipperByShipper: {
      shipper_status: {
        id: { _eq: Number(shipper_status) }
      }
    }
  } : undefined;
  const { data, loading, error } = useQuery(GET_LIST_REPORT_SHIPPER, {
    variables: {
      take,
      skip,
      from_date_star: from_date,
      to_date_star: to_date,
      where: {
        deleted: { _eq: false },
        ...tempShipperStatus,
        created: {
          _gte: from_date,
          _lte: to_date
        }
      }
    },
  });

  return { data: _.get(data, 'result'), loading, error, total: _.get(data, 'total.aggregate.count') };
}

export const useGetListShipperAll = () => {
  const { data, loading, error } = useQuery(GET_LIST_REPORT_SHIPPER_EXPORT, {
    variables: {
      where: { deleted: { _eq: false } }
    }
  });

  return { data: _.get(data, 'result'), loading, error };
}