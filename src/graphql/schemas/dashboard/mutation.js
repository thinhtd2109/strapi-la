import { gql } from "@apollo/client";

export const CHANGE_STATUS_WARNING = gql`
mutation UpdateShipmentWarning($arg: updateShipmentWarningInput){
    updateShipmentWarning(arg:$arg){
        id
        shipment
        remark
        status
    }
}
`;
