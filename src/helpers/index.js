import _, { fromPairs } from "lodash";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import moment from "moment";
import { notification } from "antd";

export const companyInfo = {
  name: "Công ty TNHH PINNOW VIỆT NAM",
  address: "134 Bạch Đằng, Phường 2, Quận Tân Bình, TP.HCM",
  hotline: "18000030",
  email: "cskh@pinnow.vn",
};

export const validateMessagesInputSignIn = {
  required: "Thông tin đăng nhập không chính xác",
  types: {
    email: "Thông tin đăng nhập không chính xác",
  },
};

export const formatMoney = (money) => {
  if (_.isUndefined(money)) return;
  return _.toString(money).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

export const getOrderStatusStyle = (orderStatusCode) => {
  let statusStyle = {
    color: null,
    textColor: null,
  };
  switch (orderStatusCode) {
    case "DELIVERED": {
      statusStyle.color = "#D0FFD6";
      statusStyle.textColor = "#00B517";
      break;
    }
    case "CANCELLED": {
      statusStyle.color = "#FFD9D9";
      statusStyle.textColor = "#FA3434";
      break;
    }
    case "SUBMITTED": {
      statusStyle.color = "#D2F7FF";
      statusStyle.textColor = "#02B4DB";
      break;
    }
    case "AWAITING_PICKUP": {
      statusStyle.color = "#FFE7C5";
      statusStyle.textColor = "#FCB040";
      break;
    }
    case "DELIVERING": {
      statusStyle.color = "#D5DEFF";
      statusStyle.textColor = "#2C7BE5";
      break;
    }
    case "GROUP_SUBMITTED": {
      statusStyle.color = "#000";
      statusStyle.textColor = "#FFF";
      break;
    }
    case "INITIAL": {
      statusStyle.color = "#E2E1E1";
      statusStyle.textColor = "#0A2240";
      break;
    }
    case "VERIFIED": {
      statusStyle.color = "#D2F7FF";
      statusStyle.textColor = "#02B4DB";
      break;
    }
    case "DONE": {
      statusStyle.color = "#D0FFD6";
      statusStyle.textColor = "#00B517";
      break;
    }
    default:
      statusStyle.color = "#000";
      statusStyle.textColor = "#FFF";
  }
  return statusStyle;
};

export const getBoothOrderStatus = (status) => {
  let statusStyle = {
    color: null,
    textColor: null,
  };
  switch (status) {
    case "INITIAL": {
      statusStyle.color = "#FFE7C5";
      statusStyle.textColor = "#FCB040";
      break;
    }
    case "DONE": {
      statusStyle.color = "#D0FFD6";
      statusStyle.textColor = "#00B517";
      break;
    }
    case "CANCELLED": {
      statusStyle.color = "#FFD9D9";
      statusStyle.textColor = "#FA3434";
      break;
    }
    default:
      statusStyle.color = "#000";
      statusStyle.textColor = "#FFF";
  }
  return statusStyle;
}

export const getWeekday = (day) => {
  const d = new Date(day);
  const weekday = new Array(7);

  weekday[0] = `Chủ nhật,`;
  weekday[1] = `Thứ 2,`;
  weekday[2] = `Thứ 3,`;
  weekday[3] = `Thứ 4,`;
  weekday[4] = `Thứ 5,`;
  weekday[5] = `Thứ 6,`;
  weekday[6] = `Thứ 7,`;
  return weekday[d.getDay()];
};

export const scrollTop = (top = 0) => {
  document.body.scrollTop = top;
  document.documentElement.scrollTop = top;
};
export const exportExcel = async (filterWard, wardList, data, isDistrict) => {
  const wardListCondition = !_.isEmpty(filterWard) ? filterWard : wardList;
  const ExcelJSWorkbook = new ExcelJS.Workbook();
  const wardWorkSheetList = [];
  const dataExport = [];
  const dataExcel = [];
  const customCell = [];
  const headers = [];

  const header = [
    "STT",
    "Tên khách hàng",
    "Số điện thoại",
    "Địa chỉ",
    "Sản phẩm",
    "Tổng tiền",
    "Mã đơn hàng",
    "Hình thức thanh toán",
  ];

  if (isDistrict) {
    for (let i = 0; i < wardListCondition.length; i++) {
      dataExport[wardListCondition[i].name] = [];
      dataExcel[wardListCondition[i].name] = [];

      let itemOrder = _.filter(
        _.get(data, "order"),
        (element) =>
          _.get(element, "address.district.id") === wardListCondition[i].id
      );

      if (_.size(itemOrder) > 0) {
        wardWorkSheetList[wardListCondition[i].name] =
          ExcelJSWorkbook.addWorksheet(wardListCondition[i].name);
        dataExcel[wardListCondition[i].name].push(...itemOrder);
        if (_.size(dataExcel[wardListCondition[i].name]) > 0) {
          let count = 1;
          dataExcel[wardListCondition[i].name].forEach((element) => {
            dataExport[wardListCondition[i].name].push([
              count,
              element.address.name,
              element.address.phone,
              _.get(element, "address.number", "") &&
              `${_.get(element, "address.number", "")} ` +
              _.join(
                _.pull(
                  [
                    _.get(element, "address.street.name", ""),
                    _.get(element, "address.ward.name", ""),
                    _.get(element, "address.district.name", ""),
                    _.get(element, "address.province.name", ""),
                  ],
                  "",
                  null
                ),
                ", "
              ),
              _.join(
                _.map(
                  element.order_items,
                  (item) => item.productByProduct.name
                ),
                ","
              ),
              element.total_amount,
              element.code,
              _.get(element, "paymentMethodByPaymentMethod.name", ""),
            ]);
            count++;
          });
        }

        customCell[wardListCondition[i].name] =
          wardWorkSheetList[wardListCondition[i].name].getCell("A1");
        customCell[wardListCondition[i].name].alignment = {
          vertical: "middle",
          horizontal: "center",
        };

        customCell[wardListCondition[i].name].font = {
          name: "Century",
          family: 4,
          bold: true,
        };

        headers[wardListCondition[i].name] =
          wardWorkSheetList[wardListCondition[i].name].addRow(header);

        headers[wardListCondition[i].name].font = {
          family: 4,
          bold: true,
        };

        let columnSTT = 1;
        wardWorkSheetList[wardListCondition[i].name].columns.forEach(
          (column) => {
            let dataMax = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
              dataMax = cell.value ? cell.value.toString().length : 0;
            });
            if (columnSTT === 1) {
              column.width = 5;
              columnSTT++;
            } else if (dataMax <= 2) {
              column.width = 10;
            } else {
              column.width = dataMax <= 15 ? 20 : dataMax;
            }
          }
        );

        if (dataExport[wardListCondition[i].name].length > 0) {
          dataExport[wardListCondition[i].name].forEach((element) => {
            wardWorkSheetList[wardListCondition[i].name].addRow(element);
          });
        }

        customCell[
          wardListCondition[i].name
        ].value = `Danh sách đơn hàng ${wardListCondition[i].name}`;

        wardWorkSheetList[wardListCondition[i].name].mergeCells("A1:H1");
      }
    }
  } else {
    for (let i = 0; i < wardListCondition.length; i++) {
      dataExport[wardListCondition[i].name] = [];
      dataExcel[wardListCondition[i].name] = [];


      let itemOrder = _.filter(
        _.get(data, "order"),
        (element) =>
          _.get(element, "address.ward.id") === wardListCondition[i].id
      );

      if (_.size(itemOrder) > 0) {
        wardWorkSheetList[wardListCondition[i].name] =
          ExcelJSWorkbook.addWorksheet(wardListCondition[i].name);
        dataExcel[wardListCondition[i].name].push(...itemOrder);
        if (_.size(dataExcel[wardListCondition[i].name]) > 0) {
          let count = 1;
          dataExcel[wardListCondition[i].name].forEach((element) => {
            dataExport[wardListCondition[i].name].push([
              count,
              element.address.name,
              element.address.phone,
              _.get(element, "address.number", "") &&
              `${_.get(element, "address.number", "")} ` +
              _.join(
                _.pull(
                  [
                    _.get(element, "address.street.name", ""),
                    _.get(element, "address.ward.name", ""),
                    _.get(element, "address.district.name", ""),
                    _.get(element, "address.province.name", ""),
                  ],
                  "",
                  null
                ),
                ", "
              ),
              _.join(
                _.map(
                  element.order_items,
                  (item) => item.productByProduct.name
                ),
                ","
              ),
              element.total_amount,
              element.code,
              _.get(element, "paymentMethodByPaymentMethod.name", ""),
            ]);
            count++;
          });
        }

        customCell[wardListCondition[i].name] =
          wardWorkSheetList[wardListCondition[i].name].getCell("A1");
        customCell[wardListCondition[i].name].alignment = {
          vertical: "middle",
          horizontal: "center",
        };

        customCell[wardListCondition[i].name].font = {
          name: "Century",
          family: 4,
          bold: true,
        };

        headers[wardListCondition[i].name] =
          wardWorkSheetList[wardListCondition[i].name].addRow(header);

        headers[wardListCondition[i].name].font = {
          family: 4,
          bold: true,
        };

        let columnSTT = 1;
        wardWorkSheetList[wardListCondition[i].name].columns.forEach(
          (column) => {
            let dataMax = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
              dataMax = cell.value ? cell.value.toString().length : 0;
            });
            if (columnSTT === 1) {
              column.width = 5;
              columnSTT++;
            } else if (dataMax <= 2) {
              column.width = 10;
            } else {
              column.width = dataMax <= 15 ? 20 : dataMax;
            }
          }
        );

        if (dataExport[wardListCondition[i].name].length > 0) {
          dataExport[wardListCondition[i].name].forEach((element) => {
            wardWorkSheetList[wardListCondition[i].name].addRow(element);
          });
        }

        customCell[
          wardListCondition[i].name
        ].value = `Danh sách đơn hàng ${wardListCondition[i].name}`;

        wardWorkSheetList[wardListCondition[i].name].mergeCells("A1:H1");
      }
    }
  }

  ExcelJSWorkbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "Danh_sach_don_hang.xlsx"
    );
  });
};



// export const exportExcel = (filterWard, wardList, data) => {
//   const wardListCondition = !_.isEmpty(filterWard) ? filterWard : wardList;
//   const ExcelJSWorkbook = new ExcelJS.Workbook();

//   const wardWorkSheetList = [];
//   const dataExport = [];
//   const dataExcel = [];
//   const customCell = [];
//   const headers = [];

//   const header = [
//     'STT',
//     'Trạng thái',
//     'Mã đơn hàng',
//     'Mã khách hàng',
//     'Tên khách hàng',
//     'Số điện thoại',
//     'Địa chỉ',
//     'Phường/xã',
//     'Quận/huyện',
//     'Thành phố/Tỉnh',
//     'Mã sản phẩm',
//     'Tên sản phẩm',
//     'Mã phân loại',
//     'Phân loại',
//     'Đơn vị',
//     'Số lượng',
//     'Đơn giá',
//     'Số tiền',
//     'Thời gian tạo',
//     'Hình thức thanh toán',
//     'Ghi chú'
//   ];

//   console.log(data)

//   for (let i = 0; i < wardListCondition.length; i++) {

//     dataExport[wardListCondition[i].name] = [];
//     dataExcel[wardListCondition[i].name] = [];

//     let itemOrder = _.filter(_.get(data, 'order'), (element) => _.get(element, 'address.ward.id') === wardListCondition[i].id)

//     if (_.size(itemOrder) > 0) {
//       wardWorkSheetList[wardListCondition[i].name] = ExcelJSWorkbook.addWorksheet(wardListCondition[i].name);
//       dataExcel[wardListCondition[i].name].push(...itemOrder);
//       if (_.size(dataExcel[wardListCondition[i].name]) > 0) {
//         let count = 1;
//         dataExcel[wardListCondition[i].name].forEach(element => {
//           dataExport[wardListCondition[i].name].push([
//             count,
//             element.order_status.name,
//             element.code,
//             element.account.code,
//             element.account.full_name,
//             element.account.phone,
//             _.get(element, 'address.number') && `${_.get(element, 'address.number')} ` + _.join(_.pull([_.get(element, 'address.street.name'), _.get(element, 'address.ward.name'), _.get(element, 'address.district.name'), _.get(element, 'address.province.name')], '', null), ', '),
//             _.get(element, 'address.ward.name'),
//             _.get(element, 'address.district.name'),
//             _.get(element, 'address.province.name'),
//             _.join(_.map(element.order_items, (item) => item.productByProduct.code), ','),
//             _.join(_.map(element.order_items, (item) => item.productByProduct.name), ','),
//             element.total_amount,
//             element.code
//           ]);
//           count++;
//         })
//       }

//       customCell[wardListCondition[i].name] = wardWorkSheetList[wardListCondition[i].name].getCell('A1');
//       customCell[wardListCondition[i].name].alignment = { vertical: 'middle', horizontal: 'center' };

//       customCell[wardListCondition[i].name].font = {
//         name: 'Century',
//         family: 4,
//         bold: true,
//       }

//       headers[wardListCondition[i].name] = wardWorkSheetList[wardListCondition[i].name].addRow(header);

//       headers[wardListCondition[i].name].font = {
//         family: 4,
//         bold: true,
//       }

//       let columnSTT = 1;
//       wardWorkSheetList[wardListCondition[i].name].columns.forEach((column) => {
//         let dataMax = 0;
//         column.eachCell({ includeEmpty: true }, (cell) => {
//           dataMax = cell.value ? cell.value.toString().length : 0;
//         });
//         if (columnSTT === 1) {
//           column.width = 5;
//           columnSTT++;
//         } else if (dataMax <= 2) {
//           column.width = 10;
//         } else {
//           column.width = dataMax <= 15 ? 20 : dataMax;
//         }
//       });

//       if (dataExport[wardListCondition[i].name].length > 0) {
//         dataExport[wardListCondition[i].name].forEach(element => {
//           wardWorkSheetList[wardListCondition[i].name].addRow(element);
//         })
//       }

//       customCell[wardListCondition[i].name].value = `Danh sách đơn hàng ${wardListCondition[i].name}`;

//       wardWorkSheetList[wardListCondition[i].name].mergeCells('A1:G1');
//     }

//   }

//   ExcelJSWorkbook.xlsx.writeBuffer().then((buffer) => {
//     saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Danh_sach_don_hang.xlsx');
//   });
// }

export const daysOfMonth = (timeFilter) => {
  const arr = _.words(_.get(timeFilter, "value"));
  const year = _.head(arr);
  const month = _.last(arr);
  return new Date(year, month, 0).getDate();
};

export const timer = (timeFilter) => {
  if (_.get(timeFilter, "type") === "Y") {
    return {
      type: "YEAR",
      dateFrom: `${_.get(timeFilter, "value")}-01-01`,
      dateTo: `${_.get(timeFilter, "value")}-12-31`,
    };
  }

  if (_.get(timeFilter, "type") === "M") {
    return {
      type: "MONTH",
      dateFrom: `${_.get(timeFilter, "value")}-01`,
      dateTo: `${_.get(timeFilter, "value")}-${daysOfMonth(timeFilter)}`,
    };
  }

  if (_.get(timeFilter, "type") === "W") {
    return {
      type: "WEEK",
      dateFrom: _.trim(_.head(_.split(_.get(timeFilter, "value"), "-"))),
      dateTo: _.trim(_.last(_.split(_.get(timeFilter, "value"), "-"))),
    };
  }

  return null;
};

export const getFullData = ({ timeFilter, data }) => {
  if (_.get(timeFilter, "type") === "Y") {
    let tmp = [];
    for (let i = 1; i <= 12; i++) {
      tmp.push({
        period_name: `Tháng ${i < 10 ? "0" + i : i}`,
        total_amount: 0,
      });
    }

    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < _.size(data); j++) {
        if (data[j]?.period_name === tmp[i]?.period_name) {
          tmp[i].total_amount = data[j].total_amount;
        }
      }
    }
    return tmp;
  }

  if (_.get(timeFilter, "type") === "M") {
    let tmp = [];
    for (let i = 1; i <= daysOfMonth(timeFilter); i++) {
      tmp.push({
        period_name: `${_.get(timeFilter, "value")}-${i < 10 ? "0" + i : i}`,
        total_amount: 0,
      });
    }

    for (let i = 0; i <= daysOfMonth(timeFilter); i++) {
      for (let j = 0; j < _.size(data); j++) {
        if (data[j]?.period_name === tmp[i]?.period_name) {
          tmp[i].total_amount = data[j].total_amount;
        }
      }
    }
    return tmp;
  }

  if (_.get(timeFilter, "type") === "W") {
    const from = _.head(_.split(_.get(timeFilter, "value"), "-"));
    let tmp = [];

    for (let i = 0; i < 7; i++) {
      const checkFrom = new Date(from);
      checkFrom.setDate(checkFrom.getDate() + i);
      tmp.push({
        period_name: moment(checkFrom).format("YYYY-MM-DD"),
        total_amount: 0,
      });
    }

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < _.size(data); j++) {
        if (data[j]?.period_name === tmp[i]?.period_name) {
          tmp[i].total_amount = data[j].total_amount;
        }
      }
    }

    return tmp;
  }

  return null;
};

export const handleReportSalesList = (data = [], isWallet) => {
  let result = [];
  let count = 0;

  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].order_items.length; j++) {
        result.push({
          key: count.toString(),
          orderCode:
            { code: _.get(data[i], "code"), id: _.get(data[i], "id") } || "-",
          order_type: data[i]?.order_type?.name || "-",
          productName: data[i].order_items[j].productByProduct.name,
          productCode: {
            id: data[i]?.order_items[j]?.productByProduct?.id,
            code: data[i]?.order_items[j].productByProduct.code,
            isPromotion: false,
          },
          order_type: data[i]?.order_type?.name,
          product_sku: data[i]?.order_items[j]?.product_sku?.sku || "-",
          time_complete: data[i]?.order_status_record.created,
          booths: {
            code: _.get(data[i], "order_booths[0].boothByBooth.code") || "-",
            id: _.get(data[i], "order_booths[0].boothByBooth.id"),
          },
          apply_price:
            data[i]?.order_items[j]?.price > data[i]?.order_items[j]?.sale_price
              ? "Sỉ"
              : "Lẻ" || "-",
          created: data[i].created,
          product_type: data[i]?.order_items[j]?.product_type?.name || "-",
          voucher_amount: data[i].voucher_amount,
          order_status: {
            code: data[i]?.order_status?.code,
            name: data[i]?.order_status.name,
          },
          wholesale_price: data[i].order_items[j].wholesale_price,
          package: data[i]?.order_items[j]?.package,
          unitSales: data[i].order_items[j].product_type?.name || "-",
          unit: data[i].order_items[j].productByProduct.unitByUnit?.name || "-",
          quantity:
            !_.isUndefined(
              _.get(data[i], "order_booths[0].order_booth_items.quantity")
            ) &&
              _.get(data[i], "order_booths[0].order_booth_items.quantity") !== 0
              ? _.get(data[i], "order_booths[0].order_booth_items.quantity")
              : data[i].order_items[j]?.quantity,
          shipper: {
            code: _.get(data[i], "shipments[0].shipperByShipper.code") || "-",
            id: _.get(data[i], "shipments[0].shipperByShipper.id") || "-",
          },
          price: data[i]?.order_items[j]?.sale_price || 0,
          amount: data[i]?.order_items[j]?.amount || 0,
          customerCode: data[i]?.account?.code || "-",
          ward: data[i]?.addressByAddress?.wardByWard?.name || "-",
          district: data[i]?.addressByAddress?.districtByDistrict?.name || "-",
          payment_method:
            data[i]?.paymentMethodByPaymentMethod?.code === "CASH"
              ? "Tiền mặt"
              : data[i].paymentMethodByPaymentMethod.name || "-",
        });
        count++;
      }

      //Combo 3kg rau củ
      if (data[i].promotionComboByPromotionCombo) {
        for (
          let j = 0;
          j < _.size(data[i].promotionComboByPromotionCombo.promotion_products);
          j++
        ) {
          result.push({
            key: count.toString(),
            orderCode: {
              code: _.get(data[i], "code"),
              id: _.get(data[i], "id"),
            },
            order_type: data[i]?.order_type?.name || "-",
            productName: data[i].promotionComboByPromotionCombo.name,
            productCode: { id: "", code: "Combo", isPromotion: true },
            product_sku: "-",
            apply_price: "-",
            created: data[i].created,
            unitSales: "-",
            unit:
              data[i]?.promotionComboByPromotionCombo?.promotion_products[j]
                ?.productByProduct?.unitByUnit.name || "-",
            quantity:
              data[i]?.promotionComboByPromotionCombo?.promotion_products[j]
                ?.productByProduct.quantity || "-",
            price:
              data[i]?.promotionComboByPromotionCombo?.promotion_products[j]
                ?.productByProduct.price || 0,
            amount:
              data[i]?.promotionComboByPromotionCombo?.promotion_products[j]
                ?.productByProduct.quantity *
              data[i].promotionComboByPromotionCombo.promotion_products[j]
                .productByProduct.price || 0,
            customerCode: data[i]?.account?.code || "-",
            ward: data[i]?.addressByAddress?.wardByWard?.name || "-",
            district:
              data[i]?.addressByAddress?.districtByDistrict?.name || "-",
            payment_method: "-",
          });
          count++;
        }
      }

      for (let j = 0; j < data[i].payments.length; j++) {
        if (!_.isNull(data[i].payments[j]?.voucherByVoucher)) {
          result.push({
            key: count.toString(),
            orderCode: {
              code: _.get(data[i], "code"),
              id: _.get(data[i], "id"),
            },
            order_type: data[i]?.order_type?.name || "-",
            productName: "Voucher",
            productCode: {
              id: "",
              code: _.get(data[i].payments[j], "voucherByVoucher.code"),
              isPromotion: true,
            },
            order_type: data[i]?.order_type?.name,
            product_sku: "-",
            apply_price: "-",
            created: data[i].created,
            product_type: "-",
            unitSales: "-",
            unit: "-",
            quantity: 1,
            price: -_.get(data[i].payments[j], "amount", 0),
            amount: -_.get(data[i].payments[j], "amount", 0),
            customerCode: data[i].account.code || "-",
            ward: data[i]?.addressByAddress?.wardByWard?.name || "-",
            district:
              data[i]?.addressByAddress?.districtByDistrict?.name || "-",
            payment_method: "-",
          });
          count++;
        }
        if (data[i].payments[j]?.payment_method?.code === "PINNOW") {
          result.push({
            key: count.toString(),
            orderCode: {
              code: _.get(data[i], "code"),
              id: _.get(data[i], "id"),
            },
            order_type: data[i]?.order_type?.name || "-",
            productName: "Ví Pinnow",
            productCode: {
              id: "",
              code: data[i].payments[j]?.payment_method?.code,
              isPromotion: false,
            },
            order_type: data[i]?.order_type?.name,
            product_sku: "-",
            apply_price: "-",
            created: data[i].created,
            product_type: "-",
            unitSales: "-",
            unit: "-",
            quantity: 1,
            price: -_.get(data[i].payments[j], "amount"),
            amount: _.get(data[i].payments[j], "amount"),
            customerCode: data[i].account.code || "-",
            ward: data[i]?.addressByAddress?.wardByWard?.name || "-",
            district:
              data[i]?.addressByAddress?.districtByDistrict?.name || "-",
            payment_method: "-",
          });
          count++;
        }
      }
    }
  }
  return result;
};

export const handleReportSummaryList = (dataList) => {
  return dataList;
};

export const exportExcelReport = (dataList, dateFrom, dateTo) => {
  const ExcelJSWorkbook = new ExcelJS.Workbook();
  const worksheet = ExcelJSWorkbook.addWorksheet("Báo cáo bán hàng");

  const header = [
    "STT",
    "Trạng thái",
    "Mã đơn hàng",
    "Loại đơn hàng",
    "Tên sản phẩm",
    "Phân loại",
    "Mã phân loại",
    "Mã sản phẩm",
    "Đơn vị bán",
    "Hình thức",
    "Số lượng",
    "Đơn giá",
    "Thành tiền",
    "Áp dụng giá (Sỉ/Lẻ)",
    "Mã khách hàng",
    "Phường",
    "Quận",
    "Thời gian tạo",
    "Hình thức thanh toán",
    "Thời gian hoàn thành",
    "Kho hàng lưu động",
    "Shipper",
  ];
  const dataToExport = [];
  if (!!dataList && dataList.length > 0) {
    let i = 1;
    dataList.forEach((value) => {
      //ToDo
      dataToExport.push([
        i++,
        _.get(value, "order_status.name", "-"),
        _.get(value, "orderCode.code"),
        _.get(value, "order_type"),
        _.get(value, "productName"),
        _.get(value, "product_type"),
        _.get(value, "product_sku"),
        _.get(value, "productCode.code"),
        _.get(value, "unit"),
        _.get(value, "package", "-"),
        _.get(value, "quantity"),
        _.get(value, "price"),
        _.get(value, "price") * _.get(value, "quantity"),
        _.get(value, "apply_price", "-"),
        _.get(value, "customerCode"),
        _.get(value, "ward"),
        _.get(value, "district"),
        moment(_.get(value, "created")).format("DD/MM/YYYY HH:mm"),
        _.get(value, "payment_method"),
        moment(_.get(value, "time_complete")).format("DD/MM/YYYY HH:mm"),
        _.get(value, "booths.code"),
        _.get(value, "shipper.code"),
      ]);
    });
  } else {
    notification["warning"]({
      message: "Thông báo",
      description: "Không có dữ liệu",
    });
    return;
  }

  const customCell = worksheet.getCell("A1");
  customCell.alignment = { vertical: "middle", horizontal: "center" };
  customCell.font = {
    name: "Calibri",
    family: 4,
    bold: true,
  };

  const headerRow = worksheet.addRow(header);
  headerRow.font = { bold: true };
  worksheet.columns.forEach((column, index) => {
    let dataMax = 0;
    if (index === 10 || index === 11) {
      column.numFmt = '"VND "#,##0.00;[Red]-"VND"#,##0.00';
    }
    if (index === 9) {
      column.numFmt = '""#,##0.00;[Red]-""#,##0.00';
    }
    column.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      dataMax = cell.value ? cell.value.toString().length : 0;
    });
    if (dataMax <= 2) {
      column.width = 5;
    } else {
      column.width = dataMax <= 15 ? 20 : dataMax;
    }
  });

  if (dataToExport.length > 0) {
    dataToExport.forEach((value) => {
      worksheet.addRow(value);
    });
  }

  worksheet.eachRow(function (Row, rowNum) {
    Row.eachCell(function (Cell, cellNum) {
      /** cell.alignment not work */
      if (rowNum == 1) {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      } else {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
      }
    });
  });

  customCell.value = `Báo cáo bán hàng (${moment(dateFrom).format(
    "DD/MM/YYYY HH:mm"
  )} - ${moment(dateTo).format("DD/MM/YYYY HH:mm")})`;
  worksheet.mergeCells("A1:U1");
  ExcelJSWorkbook.xlsx
    .writeBuffer({
      useStyles: true,
    })
    .then((buffer) => {
      saveAs(
        new Blob([buffer], { type: "application/octet-stream" }),
        `Báo cáo bán hàng ${moment(dateFrom).format(
          "DD/MM/YYYY HH:mm"
        )} - ${moment(dateTo).format("DD/MM/YYYY HH:mm")}.xlsx`
      );
    });
};

export const exportExcelReportShipper = (dataList) => {
  const ExcelJSWorkbook = new ExcelJS.Workbook();
  const worksheet = ExcelJSWorkbook.addWorksheet(
    "Báo cáo chấm công shipper"
  );

  const dataToExport = [];

  const header = [
    "STT",
    "Hoạt động",
    "Mã số shipper",
    "Tên shipper",
    "Biển số xe",
    "Số điện thoại",
    "Thời gian làm việc",
    "Ngày",
    "Chấm công giờ vào",
    "Chấm công giờ ra",
    "Đánh giá",
    "Kho hàng lưu động"
  ];

  if (!!dataList && dataList.length > 0) {
    let i = 1;
    dataList.forEach((value) => {
      let from = _.split(_.get(value, "shipper.shipper_work_shifts[0].shift_time_from"), ":");
      let to = _.split(_.get(value, "shipper.shipper_work_shifts[0].shift_time_to"), ":");
      //ToDo
      dataToExport.push([
        i,
        _.get(value, "shipper.shipper_status.code", "-"),
        _.get(value, "shipper.code"),
        _.get(value, "shipper.full_name"),
        _.get(value, "shipper.license_plate") || "-",
        _.get(value, "shipper.phone"),
        `${from[0]}:${from[1]} - ${to[0]}:${to[1]}`,
        moment(value.created).format('DD/MM/YYYY'),
        _.get(value, "check_in") ? moment(_.get(value, "check_in")).format('HH:mm') : "-",
        _.get(value, "check_out") ? moment(_.get(value, "check_out")).format('HH:mm') : "-",
        _.get(value, 'shipper.rating_reviews_aggregate.aggregate.avg.star'),
        _.join(_.map(_.get(value, "shipper.booth_shippers"), (item) => item.boothByBooth.code), ", ")
      ]);
      i++;
    });
  } else {
    notification.open({
      message: "Thông báo",
      description: "Không có dữ liệu",
    });
    return;
  }

  const customCell = worksheet.getCell("A1");
  customCell.alignment = { vertical: "middle", horizontal: "center" };
  customCell.font = {
    name: "Calibri",
    family: 4,
    bold: true,
  };

  const headerRow = worksheet.addRow(header);
  headerRow.font = { bold: true };

  worksheet.columns.forEach((column) => {
    let dataMax = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      dataMax = cell.value ? cell.value.toString().length : 0;
    });
    if (dataMax <= 2) {
      column.width = 5;
    } else {
      column.width = dataMax <= 15 ? 20 : dataMax;
    }
  });

  if (dataToExport.length > 0) {
    dataToExport.forEach((value) => {
      worksheet.addRow(value);
    });
  }

  worksheet.eachRow(function (Row, rowNum) {
    Row.eachCell(function (Cell, cellNum) {
      /** cell.alignment not work */
      if (rowNum == 1) {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      } else {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
      }
    });
  });

  customCell.value = `Báo cáo shipper`;
  worksheet.mergeCells("A1:H1");
  ExcelJSWorkbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `Báo cáo shipper.xlsx`
    );
  });
};

export const exportExcelOrderReviewHistory = async (dataList) => {
  const ExcelJSWorkbook = new ExcelJS.Workbook();
  const worksheet = ExcelJSWorkbook.addWorksheet(
    "Lịch sử đánh giá shipper"
  );
  const header = [
    "STT",
    "Mã đơn hàng",
    "Trạng thái đơn hàng",
    "Thời gian đặt",
    "Thời gian giao",
    "Mã khách hàng",
    "Nội dung đánh giá",
    "Số sao đánh giá",
    "Ghi chú từ khách hàng",
  ];

  const dataToExport = [];
  if (!!dataList && dataList.length > 0) {
    let i = 1;
    dataList.forEach((value) => {
      //ToDo
      dataToExport.push([
        i,
        value?.order_code || '-',
        _.get(value, "shipperWarningStatus.name") || "-",
        _.get(value, "created") ? moment(_.get(value, "created")).format('DD/MM/YYYY HH:mm A') : '-',
        _.get(value, 'delivery_time') ? moment(_.get(value, 'delivery_time')).format('DD/MM/YYYY HH:mm') : "-",
        value?.customer_code || "-",
        value?.review || "-",
        value?.star || "-",
        value?.note || "-"
      ]);
      i++;
    });
  } else {
    notification.open({
      message: "Thông báo",
      description: "Không có dữ liệu",
    });
    return;
  }
  const customCell = worksheet.getCell("A1");
  customCell.alignment = { vertical: "middle", horizontal: "center" };
  customCell.font = {
    name: "Calibri",
    family: 4,
    bold: true,
  };

  const headerRow = worksheet.addRow(header);
  headerRow.font = { bold: true };

  worksheet.columns.forEach((column) => {
    let dataMax = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      dataMax = cell.value ? cell.value.toString().length : 0;
    });
    if (dataMax <= 2) {
      column.width = 5;
    } else {
      column.width = dataMax <= 15 ? 20 : dataMax;
    }
  });

  if (dataToExport.length > 0) {
    dataToExport.forEach((value) => {
      worksheet.addRow(value);
    });
  }

  worksheet.eachRow(function (Row, rowNum) {
    Row.eachCell(function (Cell, cellNum) {
      /** cell.alignment not work */
      if (rowNum == 1) {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      } else {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
      }
    });
  });

  customCell.value = `Lịch sử đánh giá shipper`;
  worksheet.mergeCells("A1:H1");
  ExcelJSWorkbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `Lịch sử đánh giá shipper.xlsx`
    );
  });
}

export const exportExcelOrderHistory = (dataList) => {
  const ExcelJSWorkbook = new ExcelJS.Workbook();
  const worksheet = ExcelJSWorkbook.addWorksheet(
    "Lịch sử đơn hàng shipper"
  );

  const header = [
    "STT",
    "Mã đơn hàng",
    "Trạng thái",
    "Ngày đặt hàng",
    "Ngày hoàn thành",
    "Địa chỉ giao",
    "Vị trí hoàn thành",
    "Số lần xử lý",
    "Loại đơn",
  ];

  const dataToExport = [];
  if (!!dataList && dataList.length > 0) {
    let i = 1;
    dataList.forEach((value) => {
      const address_delivery = _.join(
        _.pull(
          [
            _.get(value, "orderByOrder.addressByAddress.street.name", ""),
            _.get(value, "orderByOrder.addressByAddress.ward.name", ""),
            _.get(value, "orderByOrder.addressByAddress.district.name", ""),
            _.get(value, "orderByOrder.addressByAddress.province.name", ""),
          ],
          "",
          null
        ),
        ", "
      )
      //ToDo
      dataToExport.push([
        i,
        _.get(value, "orderByOrder.code", "-"),
        _.get(value, "shipperWarningStatus.name"),
        moment(value?.orderByOrder?.created).format("DD/MM/YYYY hh:mm A"),
        moment(value?.orderByOrder.order_status_record?.created).format("DD/MM/YYYY hh:mm A") || "-",
        address_delivery,
        `https://www.google.com/maps/search/${value?.shimentByShipment?.shipment_status_record.latitude},+${value?.shimentByShipment?.shipment_status_record.longitude}`,
        _.get(value, 'total_call_warning', 0),
        _.get(value, "orderByOrder.order_type.name")
      ]);
      i++;
    });
  } else {
    notification.open({
      message: "Thông báo",
      description: "Không có dữ liệu",
    });
    return;
  }
  const customCell = worksheet.getCell("A1");
  customCell.alignment = { vertical: "middle", horizontal: "center" };
  customCell.font = {
    name: "Calibri",
    family: 4,
    bold: true,
  };

  const headerRow = worksheet.addRow(header);
  headerRow.font = { bold: true };

  worksheet.columns.forEach((column) => {
    let dataMax = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      dataMax = cell.value ? cell.value.toString().length : 0;
    });
    if (dataMax <= 2) {
      column.width = 5;
    } else {
      column.width = dataMax <= 15 ? 20 : dataMax;
    }
  });

  if (dataToExport.length > 0) {
    dataToExport.forEach((value) => {
      worksheet.addRow(value);
    });
  }

  worksheet.eachRow(function (Row, rowNum) {
    Row.eachCell(function (Cell, cellNum) {
      /** cell.alignment not work */
      if (rowNum == 1) {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      } else {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
      }
    });
  });

  customCell.value = `Lịch sử đơn hàng shipper`;
  worksheet.mergeCells("A1:H1");
  ExcelJSWorkbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `Lịch sử đơn hàng shipper.xlsx`
    );
  });
}

export const exportExcelReportSummary = (
  dataList,
  dateFrom = undefined,
  dateTo = undefined
) => {
  const ExcelJSWorkbook = new ExcelJS.Workbook();
  const worksheet = ExcelJSWorkbook.addWorksheet(
    "Báo cáo thống kê mặt hàng và số lượng"
  );

  const header = [
    "STT",
    "Trạng thái",
    "Mã sản phẩm",
    "Tên sản phẩm",
    "Mã phân loại",
    "Phân loại",
    "Đơn vị tính",
    "Số lượng đặt hàng",
    "Thời gian",
  ];
  const dataToExport = [];
  if (!!dataList && dataList.length > 0) {
    let i = 1;
    dataList.forEach((value) => {
      //ToDo
      dataToExport.push([
        i,
        _.get(value, "order_last_time[0].orderByOrder.order_status.name", "-"),
        _.get(value, "productByProduct.code"),
        _.get(value, "productByProduct.name"),
        _.get(value, "order_last_time[0].product_sku.sku") || "-",
        _.get(value, "name"),
        _.get(value, "productByProduct.unitByUnit.name"),
        _.get(value, "total_order.aggregate.count"),
        moment(_.get(value, "order_last_time[0].orderByOrder.created")).format(
          "DD/MM/YYYY HH:mm"
        ),
      ]);
      i++;
    });
  } else {
    notification.open({
      message: "Thông báo",
      description: "Không có dữ liệu",
    });
    return;
  }

  const customCell = worksheet.getCell("A1");
  customCell.alignment = { vertical: "middle", horizontal: "center" };
  customCell.font = {
    name: "Calibri",
    family: 4,
    bold: true,
  };

  const headerRow = worksheet.addRow(header);
  headerRow.font = { bold: true };

  worksheet.columns.forEach((column) => {
    let dataMax = 0;
    column.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      dataMax = cell.value ? cell.value.toString().length : 0;
    });
    if (dataMax <= 2) {
      column.width = 5;
    } else {
      column.width = dataMax <= 15 ? 20 : dataMax;
    }
  });

  if (dataToExport.length > 0) {
    dataToExport.forEach((value) => {
      worksheet.addRow(value);
    });
  }

  worksheet.eachRow(function (Row, rowNum) {
    Row.eachCell(function (Cell, cellNum) {
      /** cell.alignment not work */
      if (rowNum == 1) {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      } else {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
      }
    });
  });

  customCell.value = `Báo cáo thống kê mặt hàng và số lượng (${moment(
    dateFrom
  ).format("DD/MM/YYYY HH:mm")} - ${moment(dateTo).format(
    "DD/MM/YYYY HH:mm"
  )})`;
  worksheet.mergeCells("A1:H1");
  ExcelJSWorkbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `Báo cáo thống kê mặt hàng và số lượng ${moment(dateFrom).format(
        "DD/MM/YYYY HH:mm"
      )} - ${moment(dateTo).format("DD/MM/YYYY HH:mm")}.xlsx`
    );
  });
};

export const exportExcelReportProduct = (
  dataList,
  dateFrom = undefined,
  dateTo = undefined
) => {
  const ExcelJSWorkbook = new ExcelJS.Workbook();
  const worksheet = ExcelJSWorkbook.addWorksheet("Báo cáo sản phẩm");

  const header = [
    "STT",
    "Trạng thái sản phẩm",
    "Mã sản phẩm",
    "Tên sản phẩm",
    "Mã phân loại",
    "Phân loại",
    "Đơn vị",
    "Giá lẻ",
    "Giá sỉ",
    "Ngày cập nhật gần nhất",
    "Mô tả sản phẩm",
    "Số lượng đã đặt",
  ];
  const dataToExport = [];
  if (!!dataList && dataList.length > 0) {
    let i = 1;
    dataList.forEach((value) => {
      //ToDo product
      dataToExport.push([
        i,
        _.get(value, "productByProduct.product_status.name", "-"),
        _.get(value, "productByProduct.code", "-"),
        _.get(value, "productByProduct.name", "-"),
        _.get(value, "product_sku.sku", "-"),
        _.get(value, "product_type.name", "-"),
        _.get(value, "productByProduct.unitByUnit.name", "-"),
        _.get(value, "price", ""),
        _.get(value, "wholesale_price", ""),
        moment(_.get(value, "updated")).format("DD/MM/YYYY HH:mm"),
        _.get(value, "description", "-"),
        _.get(value, "sale_count", ""),
      ]);
      i++;
    });
  } else {
    notification.open({
      message: "Thông báo",
      description: "Không có dữ liệu",
    });
    return;
  }

  const customCell = worksheet.getCell("A1");
  customCell.alignment = { vertical: "middle", horizontal: "center" };
  customCell.font = {
    name: "Calibri",
    family: 4,
    bold: true,
  };

  const headerRow = worksheet.addRow(header);
  headerRow.font = { bold: true };

  worksheet.columns.forEach((column, index) => {
    let dataMax = 0;
    if (index === 7 || index === 8) {
      column.numFmt = '"VND "#,##0.00;[Red]-"£"#,##0.00';
    }
    column.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      dataMax = cell.value ? cell.value.toString().length : 0;
    });
    if (dataMax <= 2) {
      column.width = 5;
    } else {
      column.width = dataMax <= 15 ? 20 : dataMax;
    }
  });

  if (dataToExport.length > 0) {
    dataToExport.forEach((value) => {
      worksheet.addRow(value);
    });
  }

  worksheet.eachRow(function (Row, rowNum) {
    Row.eachCell(function (Cell, cellNum) {
      /** cell.alignment not work */
      if (rowNum == 1) {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      } else {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
      }
    });
  });

  customCell.value = `Báo cáo sản phẩm (${moment(dateFrom).format(
    "DD/MM/YYYY HH:mm"
  )} - ${moment(dateTo).format("DD/MM/YYYY HH:mm")})`;
  worksheet.mergeCells("A1:L1");
  ExcelJSWorkbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `Báo cáo sản phẩm ${moment(dateFrom).format(
        "DD/MM/YYYY HH:mm"
      )} - ${moment(dateTo).format("DD/MM/YYYY HH:mm")}.xlsx`
    );
  });
};

export const exportExcelReportExport = async (
  dataList,
  dateFrom = undefined,
  dateTo = undefined,
  wardList,
  districtList
) => {
  const wardListCondition = wardList ? wardList : districtList;
  const ExcelJSWorkbook = new ExcelJS.Workbook();
  const wardWorkSheetList = [];
  const dataExport = [];
  const dataExcel = [];
  const customCell = [];
  const headers = [];
  const header = [
    "STT",
    "Tên sản phẩm",
    "Phân loại",
    "Mã phân loại",
    "Danh mục sản phẩm",
    "Mã sản phẩm",
    "Đơn vị",
    "Số lượng đặt mã theo CT(theo bill)",
    "Thực xuất",
    "Đơn giá",
    "Thành tiền",
  ];
  //Start
  for (let i = 0; i < wardListCondition.length; i++) {
    dataExport[wardListCondition[i]?.name] = [];
    dataExcel[wardListCondition[i]?.name] = [];

    let itemOrder = _.filter(
      dataList,
      (element) =>
        _.get(
          element,
          "orderByOrder.addressByAddress.districtByDistrict.id"
        ) === wardListCondition[i]?.id
    );
    if (_.size(itemOrder) > 0) {
      wardWorkSheetList[wardListCondition[i]?.name] =
        ExcelJSWorkbook.addWorksheet(wardListCondition[i]?.name);
      dataExcel[wardListCondition[i]?.name].push(...itemOrder);
      if (_.size(dataExcel[wardListCondition[i]?.name]) > 0) {
        dataExcel[wardListCondition[i]?.name].forEach((value, index) => {
          dataExport[wardListCondition[i]?.name].push([
            index + 1,
            _.get(value, "productByProduct.name"),
            _.get(value, "product_type.name"),
            _.get(value, "product_sku.sku", "-"),
            _.get(value, "productByProduct.categoryByCategory.name", "-"),
            _.get(value, "productByProduct.code"),
            _.get(value, "productByProduct.unitByUnit.name"),
            _.get(value, "total", 0),
            "-",
            _.get(value, "sale_price"),
            _.get(value, "total") * _.get(value, "sale_price"),
          ]);
        });
      }

      customCell[wardListCondition[i]?.name] =
        wardWorkSheetList[wardListCondition[i]?.name].getCell("A1");
      customCell[wardListCondition[i]?.name].alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      customCell[wardListCondition[i]?.name].font = {
        name: "Century",
        family: 4,
        bold: true,
      };

      headers[wardListCondition[i]?.name] =
        wardWorkSheetList[wardListCondition[i]?.name].addRow(header);

      headers[wardListCondition[i]?.name].font = {
        family: 4,
        bold: true,
      };

      wardWorkSheetList[wardListCondition[i]?.name].columns.forEach(
        (column, index) => {
          let dataMax = 0;
          if (index === 9 || index === 10) {
            column.numFmt = '"VND "#,##0.00;[Red]-"£"#,##0.00';
          }
          column.eachCell({ includeEmpty: true }, (cell) => {
            cell.alignment = {
              vertical: "middle",
              horizontal: "center",
            };
            dataMax = cell.value ? cell.value.toString().length : 0;
          });
          if (dataMax <= 2) {
            column.width = 5;
          } else {
            column.width = dataMax <= 15 ? 20 : dataMax;
          }
        }
      );

      if (dataExport[wardListCondition[i]?.name].length > 0) {
        dataExport[wardListCondition[i]?.name].forEach((element) => {
          wardWorkSheetList[wardListCondition[i]?.name].addRow(element);
        });
      }

      customCell[
        wardListCondition[i]?.name
      ].value = `Danh sách sản phẩm quận ${wardListCondition[i]?.name}`;

      wardWorkSheetList[wardListCondition[i]?.name].mergeCells("A1:K1");
    }
  }
  ExcelJSWorkbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `Báo cáo xuất kho ${moment(dateFrom).format(
        "DD/MM/YYYY HH:mm"
      )} - ${moment(dateTo).format("DD/MM/YYYY HH:mm")}.xlsx`
    );
  });
  //End
};

export const checkedNumber = (number, message, description) => {
  if (number < 0) {
    return notification["error"]({
      message,
      description,
    });
  }
};

export const getUnitByCategory = ({ list, category }) => {
  let filterUnits = [...list];
  if (category) {
    switch (category) {
      case "MEAT":
      case "FISH":
        _.remove(filterUnits, (item) =>
          _.includes(["Củ", "Trái", "Bắp"], _.get(item, "name"))
        );
        break;
      case "VEGATABLE":
      case "JUICE":
        _.remove(filterUnits, (item) =>
          _.includes(["Con"], _.get(item, "name"))
        );
        break;
      default:
        break;
    }
  }
  return filterUnits;
};

export const dataOrderBoothHandler = async (dataList, setLoading) => {
  const results = [];
  setLoading && setLoading(true);
  _.forEach(dataList, item => {
    _.forEach(item.booth_order_items, childItem => {
      results.push({
        status: _.get(item, "booth_order_status.code"),
        time: moment(_.get(item, 'created')).format('DD/MM/YYYY HH:mm'),
        booth: _.get(item, 'booth.code') ? { id: _.get(item, 'booth.id'), code: _.get(item, 'booth.code'), name: _.get(item, 'booth.name') } : "-",
        phone: _.join(_.map(_.get(item, 'booth.booth_shippers'), shipper => _.get(shipper, 'shipperByShipper.phone')), ', ') || '-',
        type: _.get(item, 'type') || '-',
        code: _.get(item, 'code') || "-",
        productCode: _.get(childItem, 'product.code'),
        productName: _.get(childItem, 'product.name'),
        productType: _.get(childItem, 'product_type.name'),
        package: _.get(childItem, 'package') || '-',
        unit: _.get(childItem, 'unit.name') || "-",
        quantity: _.get(childItem, 'quantity') || "-",

      })
    })
  });
  setLoading && setLoading(false);
  return results;
}

export const exportBoothOrder = async (
  dataList
) => {
  const ExcelJSWorkbook = new ExcelJS.Workbook();
  const worksheet = ExcelJSWorkbook.addWorksheet("Báo cáo sản phẩm");

  const header = [
    "STT",
    "Trạng thái",
    "Thời gian",
    "Mã số kho hàng lưu động - Biển số",
    "SĐT tài xế kho hàng lưu động",
    "Loại",
    "Mã phiếu"
  ];
  const dataToExport = [];
  if (!!dataList && dataList.length > 0) {
    let i = 1;
    dataList.forEach((value) => {
      //ToDo product
      dataToExport.push([
        i,
        _.get(value, 'booth_order_status.code') === "INITIAL" ? "Yêu cầu" : _.get(value, 'booth_order_status.code') === "DONE" ? "Hoàn thành" : "Hủy",
        moment(_.get(value, 'created')).format('DD/MM/YYYY HH:mm'),
        _.get(value, "boothByBooth.code", "") + " - " + _.get(value, 'boothByBooth.name', ""),
        _.join(_.map(_.get(value, 'boothByBooth.booth_accounts'), item => _.replace(_.get(item, 'accountByAccount.phone'), '+84', '0')), ', ') || "-",
        value?.type === "IN" ? "Nhập" : "Xuất",
        _.get(value, "code", "-"),
      ]);
      i++;
    });
  } else {
    notification.open({
      message: "Thông báo",
      description: "Không có dữ liệu",
    });
    return;
  }

  const customCell = worksheet.getCell("A1");
  customCell.alignment = { vertical: "middle", horizontal: "center" };
  customCell.font = {
    name: "Calibri",
    family: 4,
    bold: true,
  };

  const headerRow = worksheet.addRow(header);
  headerRow.font = { bold: true };

  worksheet.columns.forEach((column, index) => {
    let dataMax = 0;
    if (index === 7 || index === 8) {
      column.numFmt = '"VND "#,##0.00;[Red]-"£"#,##0.00';
    }
    column.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      dataMax = cell.value ? cell.value.toString().length : 0;
    });
    if (dataMax <= 2) {
      column.width = 5;
    } else {
      column.width = dataMax <= 15 ? 20 : dataMax;
    }
  });

  if (dataToExport.length > 0) {
    dataToExport.forEach((value) => {
      worksheet.addRow(value);
    });
  }

  worksheet.eachRow(function (Row, rowNum) {
    Row.eachCell(function (Cell, cellNum) {
      /** cell.alignment not work */
      if (rowNum == 1) {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      } else {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
      }
    });
  });

  customCell.value = `Phiếu nhập`;
  worksheet.mergeCells("A1:L1");
  ExcelJSWorkbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `Phiếu nhập.xlsx`
    );
  });
};

export const exportAllExport = (dataList) => {
  const ExcelJSWorkbook = new ExcelJS.Workbook();
  const worksheet = ExcelJSWorkbook.addWorksheet("Báo cáo đơn hàng");

  const header = [
    "STT",
    "Tên khách hàng",
    "Số điện thoại",
    "Địa chỉ",
    "Sản phẩm",
    "Tổng tiền",
    "Mã đơn hàng",
    "Hình thức thanh toán",
  ];
  const dataToExport = [];
  if (!!dataList && dataList.length > 0) {
    let i = 1;
    dataList.forEach((value) => {
      //ToDo product
      dataToExport.push([
        i,
        value.address.name,
        value.address.phone,
        _.get(value, "address.number", "") &&
        `${_.get(value, "address.number", "")} ` +
        _.join(
          _.pull(
            [
              _.get(value, "address.street.name", ""),
              _.get(value, "address.ward.name", ""),
              _.get(value, "address.district.name", ""),
              _.get(value, "address.province.name", ""),
            ],
            "",
            null
          ),
          ", "
        ),
        _.join(
          _.map(
            value.order_items,
            (item) => item.productByProduct.name
          ),
          ","
        ),
        value.total_amount,
        value.code,
        _.get(value, "paymentMethodByPaymentMethod.name", ""),
      ]);
      i++;
    });
  } else {
    notification.open({
      message: "Thông báo",
      description: "Không có dữ liệu",
    });
    return;
  }

  const customCell = worksheet.getCell("A1");
  customCell.alignment = { vertical: "middle", horizontal: "center" };
  customCell.font = {
    name: "Calibri",
    family: 4,
    bold: true,
  };

  const headerRow = worksheet.addRow(header);
  headerRow.font = { bold: true };

  worksheet.columns.forEach((column, index) => {
    let dataMax = 0;
    if (index === 7 || index === 8) {
      column.numFmt = '"VND "#,##0.00;[Red]-"£"#,##0.00';
    }
    column.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      dataMax = cell.value ? cell.value.toString().length : 0;
    });
    if (dataMax <= 2) {
      column.width = 5;
    } else {
      column.width = dataMax <= 15 ? 20 : dataMax;
    }
  });

  if (dataToExport.length > 0) {
    dataToExport.forEach((value) => {
      worksheet.addRow(value);
    });
  }

  worksheet.eachRow(function (Row, rowNum) {
    Row.eachCell(function (Cell, cellNum) {
      /** cell.alignment not work */
      if (rowNum == 1) {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      } else {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
      }
    });
  });

  customCell.value = `Danh sách đơn hàng`;
  worksheet.mergeCells("A1:L1");
  ExcelJSWorkbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "Danh_sach_don_hang.xlsx"
    );
  });
};

export const exportExcelReportExportAll = (dataList) => {
  const ExcelJSWorkbook = new ExcelJS.Workbook();
  const worksheet = ExcelJSWorkbook.addWorksheet("Báo cáo xuất kho");

  const header = [
    "STT",
    "Tên sản phẩm",
    "Phân loại",
    "Mã phân loại",
    "Danh mục sản phẩm",
    "Mã sản phẩm",
    "Đơn vị",
    "Số lượng đặt mã theo CT(theo bill)",
    "Thực xuất",
    "Đơn giá",
    "Thành tiền",
  ];
  const dataToExport = [];
  if (!!dataList && dataList.length > 0) {
    let i = 1;
    dataList.forEach((value) => {
      //ToDo product
      dataToExport.push([
        i,
        _.get(value, "productByProduct.name"),
        _.get(value, "product_type.name"),
        _.get(value, "product_sku.sku", "-"),
        _.get(value, "productByProduct.categoryByCategory.name", "-"),
        _.get(value, "productByProduct.code"),
        _.get(value, "productByProduct.unitByUnit.name"),
        _.get(value, "total", 0),
        "-",
        _.get(value, "sale_price"),
        _.get(value, "total") * _.get(value, "sale_price"),
      ]);
      i++;
    });
  } else {
    notification.open({
      message: "Thông báo",
      description: "Không có dữ liệu",
    });
    return;
  }

  const customCell = worksheet.getCell("A1");
  customCell.alignment = { vertical: "middle", horizontal: "center" };
  customCell.font = {
    name: "Calibri",
    family: 4,
    bold: true,
  };

  const headerRow = worksheet.addRow(header);
  headerRow.font = { bold: true };

  worksheet.columns.forEach((column, index) => {
    let dataMax = 0;
    if (index === 9 || index === 10) {
      column.numFmt = '"VND "#,##0.00;[Red]-"£"#,##0.00';
    }
    column.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
      };
      dataMax = cell.value ? cell.value.toString().length : 0;
    });
    if (dataMax <= 2) {
      column.width = 5;
    } else {
      column.width = dataMax <= 15 ? 20 : dataMax;
    }
  });

  if (dataToExport.length > 0) {
    dataToExport.forEach((value) => {
      worksheet.addRow(value);
    });
  }

  worksheet.eachRow(function (Row, rowNum) {
    Row.eachCell(function (Cell, cellNum) {
      /** cell.alignment not work */
      if (rowNum == 1) {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "center",
        };
      } else {
        Cell.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
      }
    });
  });

  customCell.value = `Danh sách xuất kho`;
  worksheet.mergeCells("A1:L1");
  ExcelJSWorkbook.xlsx.writeBuffer().then((buffer) => {
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "Danh_sach_xuat_kho.xlsx"
    );
  });
}