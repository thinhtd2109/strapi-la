import React, { useState } from "react";
import { Typography, Table, Row, Tag, Radio, Tooltip, Button } from "antd";
import { Link, useHistory } from "react-router-dom";
import _ from "lodash";
import styles from "./styles.module.scss";
import "./styles.scss";
import { PAGE_INDEX, PAGE_SIZE } from "../../../constant/info";
import PaginationComponent from "../../../components/PaginationComponent";
import WarningModal from "../../../components/Modal/WarningModal";
import { useChangeStatus, useGetDashboardShipper } from "./hooks";
import clsx from "clsx";

const { Title } = Typography;

const DashboardShipper = () => {
  const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [skip, setSkip] = useState(0);

  const [totalCall, setTotalCall] = useState();

  const [loadingChangeStatus, setLoadingChangeStatus] = useState(false);

  const [changeStatusVariables, setChangeStatusVariables] = useState({
    id: "",
    shipment: "",
    status: 1,
    remark: "",
  });

  const history = useHistory();

  const [confirmAction, setConfirmAction] = useState(false);

  const { data, loading, count } = useGetDashboardShipper({
    skip,
    take: pageSize,
  });

  const update = useChangeStatus();

  const columns = [
    {
      key: "code",
      title: "Mã shipper",
      width: 250,
      ellipsis: true,
      render: (text, record) => (
        <Link
          style={{ width: "100%", cursor: "pointer" }}
          to={`/shipper/detail/${_.get(record, "id")}`}
        >
          {record.shipper_info.code || "-"}
        </Link>
      ),
    },
    {
      key: "code_order",
      title: "Mã đơn hàng",
      ellipsis: true,
      width: 250,
      render: (record) => (
        <div
          onClick={() => history.push(`/order/detail/${_.get(record, "shipment.order.id")}`)}
          style={{ width: "100%", cursor: "pointer" }}
        >
          {
            _.get(record, "shipment.order.id") ? <Link to={`/order/detail/${_.get(record, "shipment.order.id")}`}>{_.get(record, "shipment.order.code")}</Link> : "-"
          }

        </div>
      ),
    },
    {
      key: "full_name",
      title: "Họ và tên",
      ellipsis: true,
      width: 250,
      render: (record) => (
        <div
          onClick={() => history.push(`/shipper/detail/${_.get(record, "id")}`)}
          style={{ width: "100%", cursor: "pointer" }}
        >
          {record.shipper_info.full_name}
        </div>
      ),
    },
    {
      key: "online",
      title: "Hoạt động",
      align: "center",
      width: 250,
      ellipsis: true,
      render: (record) => {
        let className;
        if (record.shipper_info?.shipper_status?.code === "READY") {
          className = "radio-active";
        }

        if (record.shipper_info?.shipper_status?.code === "BLOCKED") {
          className = "radio-unactive";
        }

        if (record.shipper_info?.shipper_status?.code === "STOP") {
          className = "radio-stopactive";
        }
        return (
          <div
            onClick={() => history.push(`/shipper/edit/${_.get(record, "id")}`)}
            style={{ width: "100%", cursor: "pointer" }}
          >
            <Radio
              checked={true}
              className={className}
            />
          </div>
        )
      }
    },
    {
      key: "active",
      title: "Trạng thái",
      width: 250,
      ellipsis: true,
      // render: (record) => (
      //   <div
      //     onClick={() => history.push(`/shipper/edit/${_.get(record, "id")}`)}
      //     style={{ width: "100%", cursor: "pointer" }}
      //   >
      //     <Tag className={styles.tagsActive} color="error">
      //       <span style={{ fontWeight: "bold" }}>
      //         {record.shipper_info?.shipper_status?.name}
      //       </span>
      //     </Tag>
      //   </div>
      // ),
      render: (record) => {
        let color = { backgroundColor: null, color: null }
        if (_.get(record, "shipper_warning_status.code") === "DELAY_GG_EST") {
          color.backgroundColor = "#FFE7C5";
          color.color = "#FCB040";

        }
        if (
          _.get(record, "shipper_warning_status.code") === "OUT_OF_AREA" ||
          _.get(record, "shipper_warning_status.code") === "DELAY_DELIVERY"
        ) {
          color.backgroundColor = "#FFD9D9";
          color.color = "#FA3434";
        }

        if (_.get(record, "shipper_warning_status.code") === "DELIVERING") {
          color.color = "#2C7BE5";
          color.backgroundColor = "#D4DEFF";
        }

        if (_.get(record, "shipper_warning_status.code") === "AWAITING_PICKUP") {
          color.color = "#FCB040";
          color.backgroundColor = "#FFE7C5";
        }

        return <div
          onClick={() => history.push(`/shipper/edit/${_.get(record, "id")}`)}
          style={{ width: "100%", cursor: "pointer" }}
        >
          <Tag style={{ width: '100%', textAlign: 'center' }} color={color.backgroundColor}><span style={{ color: color.color, width: '100%' }}>{(_.get(record, "shipper_warning_status.code") === "STOP" || _.get(record, "shipper_warning_status.code") === "BLOCKED") ? " - " : _.get(record, "shipper_warning_status.name")}</span></Tag>
        </div>
      },
    },
    {
      key: "booths",
      title: "Kho hàng",
      width: 350,
      ellipsis: true,
      render: (record) => {
        let result = _.map(
          record.shipper_info.booth_shippers,
          (item) => <Link to={`/booths/detail/${item.boothByBooth.id}`}>{item.boothByBooth.code}</Link>
        );
        result.length > 0 ? result = result.reduce((prev, curr) => [prev, ', ', curr]) : result = "-";
        return (
          <Tooltip title={result}>
            <div className={"booth_incharse"}>
              {result}
            </div>
          </Tooltip>

        );
      },
    },
    {
      key: "phone",
      title: "Số điện thoại",
      width: 250,
      ellipsis: true,
      render: (record) => (
        <div
          onClick={() => history.push(`/shipper/edit/${_.get(record, "id")}`)}
          style={{ width: "100%", cursor: "pointer" }}
        >
          <span>{_.get(record, "shipper_info.phone", "-")}</span>
        </div>
      ),
    },
    {
      key: "shipper_plate",
      title: "Biển số xe",
      width: 250,
      ellipsis: true,
      render: (record) => (
        <div
          onClick={() => history.push(`/shipper/edit/${_.get(record, "id")}`)}
          style={{ width: "100%", cursor: "pointer" }}
        >
          <span>{_.get(record, "shipper_info.license_plate", "-")}</span>
        </div>
      ),
    },
    {
      key: "place",
      title: "Khu vực hoạt động",
      width: 400,
      ellipsis: true,
      render: (text, record, index) => {
        const data = [];
        _.forEach(_.get(record, "shipper_info.booth_shippers"), (item) => {
          _.forEach(item.boothByBooth.booth_incharges, (element) => {
            data.push(element);
          });
        });

        const grouped = _.groupBy(data, (address) => address.district.name);
        let keys = Object.keys(grouped);
        let tooltip = _.map(keys, (item, index) => {
          let province = _.find(
            grouped[`${item}`],
            (element) => element.district.name === item
          );
          return (
            <span>

              {province.province.name +
                ", " +
                item +
                (_.find(grouped[`${item}`], (element) => element.ward.name)
                  ? " - "
                  : "") +
                _.join(
                  _.map(grouped[`${item}`], (item) => item.ward.name),
                  ", "
                ) +
                (!_.isEmpty(keys[index + 1]) ? ". " : "")}

              <br />
            </span>
          );
        });
        let result = _.map(keys, (item, index) => {
          let province = _.find(
            grouped[`${item}`],
            (element) => element.district.name === item
          );


          return (
            <span>
              <>
                {
                  province.province.name +
                  ", " +
                  item +
                  (_.find(grouped[`${item}`], (element) => element.ward.name)
                    ? " - "
                    : "") +
                  _.join(
                    _.map(grouped[`${item}`], (item) => item.ward.name),
                    ", "
                  ) +
                  (!_.isEmpty(keys[index + 1]) ? ", " : "")
                }
              </>
            </span>
          );
        });

        return (
          <Tooltip title={tooltip}>
            <div
              className={clsx(styles.booth_incharse)}
              style={{ cursor: "pointer" }}
            >
              {!_.isEmpty(result) ? result : "-"}
            </div>
          </Tooltip>
        );
      },
    },
    {
      key: "action",
      title: "Trạng thái xử lý",
      width: 250,
      ellipsis: true,

      render: (record) => (
        <div
          onClick={() => history.push(`/shipper/edit/${_.get(record, "id")}`)}
          style={{ width: "100%", cursor: "pointer" }}
        >
          <span>{_.get(record, "total_call_warning") === 0 ? "Chưa gọi" : `Đã gọi lần ${_.get(record, "total_call_warning")}`}</span>
        </div>
      ),
    },
    {
      key: "change_action",
      title: "Hành động",
      width: 250,
      align: 'center',
      ellipsis: true,
      render: (record) => (
        <>
          <Button disabled={!record.shipment_id || record.shipper_info?.shipper_status?.code === "STOP" || record.total_call_warning >= 3} onClick={() => {
            setConfirmAction(true);
            setTotalCall(record.total_call_warning);
            setChangeStatusVariables((prev) => ({
              ...prev,
              id: record.id,
              shipment: record.shipment_id,
              status: null,
              remark: ""
            }));
          }} className={styles.button}>
            Xử lý
          </Button>
        </>
      ),
    },
  ];

  console.log(data)

  const changeStatus = () => {
    setLoadingChangeStatus(true);
    update({
      variables: {
        arg: {
          id: changeStatusVariables.id,
          shipment: changeStatusVariables.shipment,
          //status: changeStatusVariables.status,
          //remark: changeStatusVariables.remark
        },
      },
    }).then(
      () => {
        setConfirmAction(false);
        setLoadingChangeStatus(false);
        setChangeStatusVariables({
          id: "",
          status: "",
          shipment: "",
          remark: "",
        });
      },
      (err) => {
        setLoadingChangeStatus(false);
        setChangeStatusVariables({
          id: "",
          status: "",
          shipment: "",
          remark: "",
        });
      }
    );
  };

  return (
    <div className={styles.dashboardShipperPage}>
      <WarningModal
        width={420}
        onBack={() => setConfirmAction(false)}
        visible={confirmAction}
        title="Thông báo"
        content={`Bạn có muốn chuyển sang trạng thái đã gọi ${totalCall + 1}?`}
        onSubmit={changeStatus}
        loading={loadingChangeStatus}
      />
      <Title level={3}>Dashboard shipper</Title>
      <div className={styles.wrapper}>
        <Row className={styles.wrapperTable}>
          <Table
            dataSource={data}
            rowKey="id"
            columns={columns}
            pagination={false}
            loading={loading}
            scroll={{ x: 2000 }}
          />
        </Row>

        <PaginationComponent
          total={count}
          pageSize={pageSize}
          pageIndex={pageIndex}
          pageSizeOptions={[10, 20, 40, 80, 120]}
          setPageSize={setPageSize}
          setPageIndex={(index) => {
            setPageIndex(index);
            setSkip(index * pageSize - pageSize);
          }}
          pagename="DASHBOARD_SHIPPER"
        />
      </div>
    </div>
  );
};

export default DashboardShipper;
