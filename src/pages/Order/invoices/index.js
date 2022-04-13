import { Button, Row } from "antd";
import _ from "lodash";
import moment from "moment";
import React, { useState, useRef, useEffect, Fragment } from "react";
import { useReactToPrint } from "react-to-print";
import { ReactComponent as LogoPinnow } from '../../../assets/logo-pinnow-inline-black.svg';
import PrintConfirm from "../../../components/Modal/PrintConfirm";
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_LIST_ORDER_STATUS } from "../../../graphql/schemas/order/mutation";
import { companyInfo, formatMoney } from "../../../helpers";
import InvoiceItem from "./InvoiceItem";
import style from "./style.module.scss";
import { useHistory } from "react-router-dom";
import { GET_APP_CONFIG, GET_ORDER_LIST } from "../../../graphql/schemas/order/query";
import clsx from "clsx";
import { PAGE_SIZE } from "../../../constant/info";
import Barcode from 'react-barcode';


const addClassFixedTop = () => {
  let header = document.getElementById("printButtonFixed");
  let sticky = 96;
  if (window.pageYOffset > sticky) {
    header?.classList?.add(style.fixedTop);
  } else {
    header?.classList?.remove(style.fixedTop);
  }
};

const getDate = (data) => {
  const created = moment(data, "YYYY-MM-DD[T]HH-mm");
  const date = created.get("date");
  const month = created.get("month");

  const year = created.get("year");
  return `Ngày ${date} tháng ${month + 1} năm ${year}`;
};

const Invoices = (props) => {
  const history = useHistory();

  const { orders } = props.location.state;
  const [openModal, setOpenModal] = useState(false);
  const [nextStatus, setNextStatus] = useState(null);

  const componentRef = useRef();
  const { data: dataAppConfig } = useQuery(GET_APP_CONFIG, {});

  const [updateListOrderStatus] = useMutation(UPDATE_LIST_ORDER_STATUS, {
    refetchQueries: [{
      query: GET_ORDER_LIST, variables: {
        where: {
          skip: 0,
          take: PAGE_SIZE,
          order_status: {
            code: { _nin: ["INITIAL", "WAIT_PAYMENT", "PAYMENT_FAILED"] }
          },
          deleted: { _eq: false },
        },
      }
    }]
  });

  const statusSelected = _.chain(orders).groupBy("order_status.code").map((value, key) => ({ key: key, data: value })).value();

  const enableChangeStatus = _.size(statusSelected) === 1 && !_.includes(['CANCELLED', 'DELIVERED'], _.get(_.head(statusSelected), 'key'));

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,

  });

  const toUpdateStatus = () => {
    updateListOrderStatus({
      variables: {
        data: {
          ids: _.map(orders, order => _.get(order, 'id')),
          status: nextStatus
        }
      }
    }).then((flag) => {

    })
  };

  const handlePrintClick = () => {
    if (enableChangeStatus) {
      toUpdateStatus();
    }
    handlePrint();
    history.push("/order");
  };

  useEffect(() => {
    window.onscroll = function () { addClassFixedTop() };
  });

  return (
    <Fragment>
      <Row align='end'>
        <Button id='printButtonFixed' className={clsx(style.printBtn)} onClick={() => setOpenModal(true)}>
          In hóa đơn
        </Button>
      </Row>
      <div className={style.wrapperContainer}>
        <div ref={componentRef}>
          <PrintConfirm
            visible={openModal}
            enableChangeStatus={enableChangeStatus}
            onCancel={setOpenModal}
            onConfirm={handlePrintClick}
            currentStatus={enableChangeStatus && _.get(_.head(orders), 'order_status')}
            setNextStatus={setNextStatus}
          />
          {_.map(orders, (data, key) => {
            const addressFull = _.get(data, "address.number") && `${_.get(data, "address.number")} ` + _.join(_.pull([
              _.get(data, "address.street.name", ''),
              _.get(data, 'address.ward.name', ''),
              _.get(data, "address.district.name", ''),
              _.get(data, "address.province.name", '')
            ], '', null), ', ');
            let firstOrder = _.get(data, 'promotionComboByPromotionCombo');

            return (
              <div key={key} className={style.container} >
                <div className={style.logo}>
                  <LogoPinnow fill="#FCB040" width="auto" height='45px' />
                </div>

                <p className={style.address}>{`Địa chỉ: ${_.get(_.find(_.get(dataAppConfig, 'appconfig'), ['key', 'COMPANY_ADDRESS']), 'value') || _.get(companyInfo, 'address')}`}</p>
                <p className={style.contact}>{`Điện thoại: ${_.get(_.find(_.get(dataAppConfig, 'appconfig'), ['key', 'HOTLINE']), 'value') || _.get(companyInfo, 'hotline')}`}</p>
                <p className={style.contact}>{`Email: ${_.get(_.find(_.get(dataAppConfig, 'appconfig'), ['key', 'EMAIL_CSKH']), 'value') || _.get(companyInfo, 'email')}`}</p>

                <div className={style.lineBreakDashed} />

                <p className={style.titleMedium}>Hóa đơn bán hàng</p>
                <p className={style.contact}>{`Mã đơn hàng: ${_.get(data, "code")}`}</p>
                <p className={style.contact}>{getDate(_.get(data, "created"))}</p>


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
                </div>
                <div className={style.lineBreakDashed} />
                <div style={{ display: 'flex' }}>
                  <p style={{ width: '161px' }}>Hình thức thanh toán:</p>
                  <span>{_.get(data, "paymentMethodByPaymentMethod.name", "")}</span>
                </div>
                <div className={`${style.totalItem}`}>
                  <p className={style.fontBold}>Người nhận thanh toán:</p>
                  <span className={style.fontBold}>{_.get(data, "paymentMethodByPaymentMethod.code") === 'CASH' ? <span>{formatMoney(_.get(data, "total_amount", ""))}</span> : 0}</span>
                </div>
                <div className={style.lineBreakDashed} />
                <div style={{ margin: "20px 0px 20px 0px" }}>
                  <Barcode value={_.get(data, "code", "")} width={2} height={60} margin={0} />
                </div>
                <div className={style.lineBreakDashed} />
                <div className={style.footer}>
                  <p className={style.bold}>"Tải app tặng ngay 500k"</p>
                  <p className={style.bold}>Cảm ơn và hẹn gặp lại!</p>
                  <p className={style.note}>Lưu ý: giá trên đã bao gồm thuế giá trị gia tăng</p>
                  <p className={style.note}>Pinnow chỉ xuất hóa đơn trong ngày. Quý khách vui lòng liên hệ hotline để được hỗ trợ.</p>
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </Fragment>
  );

};

export default Invoices;
