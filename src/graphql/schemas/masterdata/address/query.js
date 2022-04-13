import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import _ from "lodash";

export const GET_PROVINCES = gql`
  query GetProvinces {
    results: province(order_by: { index: asc }) {
      id
      name
    }
  }
`;

export const GET_DISTRICTS = gql`
  query GetDistricts($provinceId: uuid!, $skip: Int!, $take: Int!) {
    results: district(
      offset: $skip,
      limit: $take,
      order_by: {name: asc},
      where: { province: { _eq: $provinceId }, deleted: {_eq: false}, coordinates: {_is_null: false} }
    ) {
      id
      name
    }
  }
`;

export const GET_WARDS = gql`
  query GetWards($districtId: uuid!,$skip: Int!, $take: Int!) {
    results: ward(
      offset: $skip,
      limit: $take,
      order_by: {name: asc},
      where:{district:{_eq:$districtId}, deleted: {_eq: false}, coordinates: {_is_null: false}}
    ) {
      id
      name
    }
  }
`;

export const useGetProvinces = () => {
  const { data } = useQuery(GET_PROVINCES, {});
  return _.get(data, "results");
};

export const useGetDistricts = ({ provinceId }) => {
  const { data } = useQuery(GET_DISTRICTS, {
    variables: {
      provinceId,
      skip: 0,
      take: 1e9,
    },
    skip: !provinceId
  });
  return _.get(data, "results");
};

export const useGetWards = ({ districtId }) => {
  const { data } = useQuery(GET_WARDS, {
    variables: {
      districtId,
      skip: 0,
      take: 1e9,
    },
    skip: !districtId
  });
  return _.get(data, "results");
};
