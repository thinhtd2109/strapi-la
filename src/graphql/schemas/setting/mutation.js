
import { gql } from '@apollo/client';

export const UPDATE_SETTING = gql`
  mutation UpdateSetting($code: String!, $data: json) {
    update_setting(where: {code: {_eq: $code}}, _set: {value: $data}) {
      affected_rows
    }
  }
`;
