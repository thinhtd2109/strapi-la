import _ from "lodash";
import React from "react";
import { formatMoney } from "../../../helpers";
import style from "./style.module.scss";

const InvoiceItem = ({ data }) => {
  return (
    <div className={style.invoiceItem}>
      <div className={style.itemName}>{_.get(data, "productByProduct.name")}<span>{` (${_.get(data, "product_type.name")})`}</span></div>
      
      {
        _.get(data, "sale_price") < _.get(data, "price") && (
          <div className={style.showPrice}>{formatMoney(_.get(data,'price'))}</div>
        )
      }

      <div className={style.itemInfo}>
        <div>{formatMoney(_.get(data, "sale_price"))}</div>
        <div>{_.get(data, "quantity")}</div>
        <div>{_.get(data, "package")}</div>
        <div>{formatMoney(_.get(data, "amount"))}</div>
      </div>
      <div className={style.breakDashed} />
    </div>
  );
};

export default InvoiceItem;
