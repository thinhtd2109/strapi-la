import { useMutation, useQuery } from "@apollo/client"
import _ from "lodash";
import { CREATE_BOOTHS, DELETE_BOOTHS, UPDATE_BOOTHS } from "../../graphql/schemas/booths/mutation";
import { GET_BOOTHS_BY, GET_BOOTH_PRODUCT_LIST, GET_LIST_BOOTHS } from "../../graphql/schemas/booths/query";


export const useCreateBooth = () => {
  const [createBooths] = useMutation(CREATE_BOOTHS, {
    refetchQueries: [
      {
        query: GET_LIST_BOOTHS,
        variables: {
          skip: 0,
          take: 10,
          where: {
            deleted: {
              _eq: false
            },
          }
        }
      }
    ]
  });

  return createBooths;
}

export const useGetBooth = ({ id }) => {
  const { data, loading, error, refetch } = useQuery(GET_BOOTHS_BY, {
    variables: {

      where: {
        deleted: { _eq: false },
        id: { _eq: id }
      },
    },
    skip: !id
  });

  return {
    data: _.get(data, 'results[0]'),
    loading,
    error,
    refetch
  }
}

export const useGetListBooth = ({ searchText, province, ward, district, skip, take }) => {
  let addressArr = [];

  if (district) {
    addressArr.push({
      districtByDistrict: {
        id: { _eq: district || undefined }
      }
    })
  }

  if (ward) {
    addressArr.push({
      wardByWard: {
        id: { _eq: ward || undefined }
      }
    })
  }

  if (province) {
    addressArr.push({
      provinceByProvince: {
        id: { _eq: province || undefined }
      }
    })
  }

  if (!_.isEmpty(searchText) && _.size(searchText) >= 10 && searchText[0] === '0') {
    searchText = '+84' + _.join(_.slice(_.split(searchText, ''), 1, 10), '')
  }

  let booth_incharges = _.size(addressArr) > 0 ? {
    _and: addressArr
  } : undefined;
  const { data, loading, error, refetch } = useQuery(GET_LIST_BOOTHS, {
    variables: {
      skip,
      take,
      where: {
        deleted: {
          _eq: false
        },

        booth_incharges,

        _or: [
          {
            name: { _ilike: `%${searchText}%` }
          },
          {
            code: { _ilike: `%${searchText}%` }
          },
          {
            booth_accounts: {
              _or: [
                {
                  accountByAccount: {
                    phone: { _ilike: `%${searchText}%` }
                  }
                }
              ]
            }
          }

        ],

      }
    },
    fetchPolicy: 'cache-and-network'
  });

  return {
    data: _.get(data, 'results'),
    loading,
    error,
    total: _.get(data, 'total.aggregate.count'),
    refetch
  }
}

export const useDeleteBooth = () => {
  const [deleteBooth] = useMutation(DELETE_BOOTHS);

  return deleteBooth;
}

export const useUpdateBooth = ({ id }) => {
  const [updateBooth] = useMutation(UPDATE_BOOTHS, {
    refetchQueries: [
      {
        query: GET_LIST_BOOTHS,
        variables: {
          skip: 0,
          take: 10,
          where: {
            deleted: {
              _eq: false
            },
          }
        }
      },
      {
        query: GET_BOOTH_PRODUCT_LIST,
        variables: {
          boothId: id
        }
      }
    ]
  });

  return updateBooth;
}

