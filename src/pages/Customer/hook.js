import { useQuery } from "@apollo/client";
import _ from "lodash";
import { GET_CUSTOMER_DETAIL, GET_CUSTOMER_LIST } from "../../graphql/schemas/customer/query";

export const useGetCustomerDetail = (customerId) => {
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMER_DETAIL, {
    variables: {
      id: customerId,
    },
    skip: !customerId,
  });

  return {
    data: _.head(_.get(data, "account")),
    loading,
    error,
    refetch,
  };
};


export const useGetListCustomer = ({ skip, pageSize, searchContent }) => {
  if (searchContent.charAt(0) === "0") {
    searchContent = `+84${searchContent.substring(1)}`;
  }
  const { loading, data, refetch } = useQuery(GET_CUSTOMER_LIST, {
    variables: {
      skip: skip,
      take: pageSize,
      where: {
        deleted: { _eq: false },
        type: { _eq: "BUYER" },
        phone: { _is_null: false },
        _or: [
          { full_name: { _ilike: `%${_.trim(searchContent)}%` } },
          { code: { _ilike: `%${_.trim(searchContent)}%` } },
          { phone: { _ilike: `%${_.trim(searchContent)}%` } },
        ],
      },
    },
  });

  return { data, loading, refetch }
}