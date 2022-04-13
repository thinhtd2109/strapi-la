import { useQuery } from "@apollo/client";
import { Button } from "antd";
import _ from "lodash";
import moment from "moment";
import React, { useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ReactComponent as LogoPinnow } from '../../../assets/logo-pinnow-inline-black.svg';
import { user } from "../../../constant/user";
import { GET_APP_CONFIG } from "../../../graphql/schemas/order/query";
import { companyInfo, formatMoney } from "../../../helpers";
import { useIncrementCountPrint } from "../hooks";
import InvoiceItem from "./InvoiceItem";
import style from "./style.module.scss";
import Barcode from 'react-barcode';
const Invoice = (props) => {
  const { data } = props.location.state;
  const { data: dataAppConfig } = useQuery(GET_APP_CONFIG, {});


  const getDate = () => {
    const created = moment(_.get(data, "created"), "YYYY-MM-DD[T]HH-mm");
    const date = created.get("date");
    const month = created.get("month");

    const year = created.get("year");
    return `Ngày ${date} tháng ${month + 1} năm ${year}`;
  };

  const incrementPrintCount = useIncrementCountPrint();

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      incrementPrintCount({
        variables: {
          ids: [_.get(data, 'id')],
          printBy: user.getValue('id')
        }
      });
    }
  });

  const addressFull = _.get(data, "address.number", '') && `${_.get(data, "address.number", '')} ` + _.join(_.pull([
    _.get(data, "address.street.name", ''),
    _.get(data, 'address.ward.name', ''),
    _.get(data, "address.district.name", ''),
    _.get(data, "address.province.name", '')
  ], '', null), ', ');

  let firstOrder = _.get(data, 'promotionComboByPromotionCombo');

  return (
    <div className={style.wrapperContainer}>
      <div className={style.container} ref={componentRef}>
        <div className={style.logo}>
          <LogoPinnow fill="#FCB040" width="auto" height='45px' />
        </div>

        <p className={style.address}>{`Địa chỉ: ${_.get(_.find(_.get(dataAppConfig, 'appconfig'), ['key', 'COMPANY_ADDRESS']), 'value') || _.get(companyInfo, 'address')}`}</p>
        <p className={style.contact}>{`Điện thoại: ${_.get(_.find(_.get(dataAppConfig, 'appconfig'), ['key', 'HOTLINE']), 'value') || _.get(companyInfo, 'hotline')}`}</p>
        <p className={style.contact}>{`Email: ${_.get(_.find(_.get(dataAppConfig, 'appconfig'), ['key', 'EMAIL_CSKH']), 'value') || _.get(companyInfo, 'email')}`}</p>

        <div className={style.lineBreakDashed} />

        <p className={style.titleMedium}>Hóa đơn bán hàng</p>
        <p className={style.contact}>{`Mã đơn hàng: ${_.get(data, "code")}`}</p>
        <p className={style.contact}>{getDate()}</p>

        <div className={style.customer}>
          <p className={style.contact}>{`Khách hàng: ${_.get(data, "address.name")}`}</p>
          <p className={style.contact}>{`SĐT: ${_.get(data, "address.phone")}`}</p>
          <p className={style.contact}>{`Địa chỉ: ${addressFull}`}</p>
        </div>

        <div className={style.itemHeader}>
          <div>Đơn giá</div>
          <div>SL</div>
          <div>ĐVT</div>
          <div>Thành tiền</div>
        </div>

        {
          _.map(_.get(data, "order_items"), (item, key) => <InvoiceItem key={key} data={item} />)
        }

        {
          firstOrder && _.map(_.get(firstOrder, 'promotion_products'), (item, key) => {
            return (
              <div key={key} className={style.invoiceItem}>
                <div className={style.itemName}>{_.get(item, "productByProduct.name")}</div>
                <div className={style.itemInfo}>
                  <div>{_.get(item, "productByProduct.price")}</div>
                  <div>{_.get(item, "productByProduct.quantity")}</div>
                  <div>{_.get(item, "productByProduct.unitByUnit.name")}</div>
                  <div>{_.get(item, "productByProduct.price") * _.get(item, "productByProduct.quantity")}</div>
                </div>
                <div className={style.breakDashed} />
              </div>
            )
          })
        }


        <div className={style.invoiceItem}>
          <div className={style.itemName}>Ghi chú:</div>
          <div className={style.itemInfo}>
            {_.get(data, 'note') || "-"}
          </div>
          <div className={style.breakDashed} />
        </div>

        <div className={style.total}>
          <div className={style.totalItem}>
            <p>Tổng tiền hàng:</p>
            <span>{formatMoney(_.get(data, "amount"))}</span>
          </div>
          <div className={`${style.totalItem} ${style.normal}`}>
            <p>Voucher:</p>
            <span>{_.get(data, "voucher_amount") ? `-${formatMoney(_.get(data, "voucher_amount"))}` : 0}</span>
          </div>
          <div className={`${style.totalItem} ${style.normal}`}>
            <p>Ví Pinnow:</p>
            <span>{_.get(data, "pinnow_amount") ? `-${formatMoney(_.get(data, "pinnow_amount"))}` : 0}</span>
          </div>
          <div className={style.totalItem}>
            <p>Tổng thanh toán:</p>
            <span>{formatMoney(_.get(data, "total_amount"))}</span>
          </div>
          <div className={style.lineBreakDashed} />
          <div style={{ display: 'flex', fontWeight: 400 }}>
            <p style={{ width: '161px' }}>Hình thức thanh toán:</p>
            <span>{_.get(data, "paymentMethodByPaymentMethod.name", "")}</span>
          </div>
          <div className={`${style.totalItem}`} style={{ fontWeight: 600 }}>
            <p className={style.fontBold}>Người nhận thanh toán:</p>
            <span className={style.fontBold}>{_.get(data, "paymentMethodByPaymentMethod.code") === 'CASH' ? <span>{formatMoney(_.get(data, "total_amount", ""))}</span> : 0}</span>
          </div>
          <div className={style.lineBreakDashed} />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <Barcode value={_.get(data, "code", "")} width={2} height={60} margin={0} />
        </div>
        <div className={style.lineBreakDashed} />
        <div className={style.footer}>
          <p className={style.bold}>"Tải app tặng ngay 500k"</p>
          <p className={style.bold}>Cảm ơn và hẹn gặp lại!</p>
          <p className={style.note}>Lưu ý: giá trên đã bao gồm thuế giá trị gia tăng</p>
          <p className={style.note}>Pinnow chỉ xuất hóa đơn trong ngày. Quý khách vui lòng liên hệ hotline để được hỗ trợ.</p>
        </div>

        <Button className={style.printBtn} onClick={handlePrint}>In hóa đơn</Button>
      </div >
    </div >
  );
};

export default Invoice;
