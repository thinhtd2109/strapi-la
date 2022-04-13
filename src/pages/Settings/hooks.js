import { useMutation, useQuery } from "@apollo/client";
import { GET_SETTINGS } from "../../graphql/schemas/setting/query";
import { UPDATE_SETTING } from "../../graphql/schemas/setting/mutation";
import _ from "lodash";
import { notification } from 'antd';
import slugs from "../../constant/slugs";

export const useGetSettings = () => {
  const { data, loading, error, refetch } = useQuery(GET_SETTINGS);
  const res = _.find(_.get(data, 'setting'), ['code', 'SHIPPER']);

  return { 
    data: _.get(res,'value'),
    loading,
    error,
    refetch
  };
};

export const useUpdateSetting = (setUpdating) => {
  const [updateSetting, { loading, error }] = useMutation(UPDATE_SETTING, {
    onCompleted: () => {

    },
    onError: (err) => {
      setUpdating(false);
      notification['error']({
          message: 'Thông báo',
          description:
              'Cập nhật thất bại.',
      });
    }
  });

  return {
    updateSetting,
    loading,
    error
  }
}