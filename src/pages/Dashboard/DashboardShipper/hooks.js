import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  GET_COUNT_DASHBOARD_SHIPPER,
  GET_DASHBOARD_SHIPPER,
} from "../../../graphql/schemas/dashboard/query";

import _ from "lodash";
import { CHANGE_STATUS_WARNING } from "../../../graphql/schemas/dashboard/mutation";

export const useGetDashboardShipper = ({ skip, take }) => {
  const { data, loading } = useSubscription(GET_DASHBOARD_SHIPPER, {
    variables: {
      skip,
      take,
    },
  });

  const { data: total } = useSubscription(GET_COUNT_DASHBOARD_SHIPPER);

  return {
    data: _.get(data, "result"),
    loading,
    count: _.get(total, "result.aggregate.count"),
  };
};

export const useChangeStatus = () => {
  const [update] = useMutation(CHANGE_STATUS_WARNING);

  return update;
};
