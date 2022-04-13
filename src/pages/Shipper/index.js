import clsx from "clsx";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import {
  Typography,
  Row,
  Input,
  Table,
  Space,
  Button,
  notification,
  Radio,
  Select,
  Col,
  Tooltip,
} from "antd";
import style from "./style.module.scss";
import Wrapper from "../../components/Wrapper/Wrapper";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { PAGE_INDEX, PAGE_SIZE } from "../../constant/info";
import { useDebounce } from "use-debounce";
import Avatar from "antd/lib/avatar/avatar";
import _ from "lodash";
import PaginationComponent from "../../components/PaginationComponent";
import WarningModal from "../../components/Modal/WarningModal";
import {
  useDeleteShipper,
  useGetListShipper,
  useGetListStatusShipper,
} from "../../graphql/schemas/hook";
import './style.scss'

const { Option } = Select;

const Shipper = () => {
  const { Title } = Typography;

  const [searchText, setSearchText] = useState("");
  const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [skip, setSkip] = useState(0);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [idDelete, setIdDelete] = useState();
  const deleteShipper = useDeleteShipper();

  const [loadingHandle, setLoadingHandle] = useState(false);

  const [rowSelection, setRowSelection] = useState([]);

  const [shipperStatus, setShipperStatus] = useState()

  const [value] = useDebounce(searchText, 1000);

  const { data, loading, count, refetch } = useGetListShipper({
    skip,
    take: pageSize,
    searchText: _.trim(value),
    shipperStatus
  });

  const { data: shipperStatusList } = useGetListStatusShipper();


  const history = useHistory();

  const deleteShipperHandle = () => {
    setLoadingHandle(true);
    deleteShipper({
      variables: {
        ids: rowSelection,
      },
    }).then(
      (res) => {
        refetch();
        setRowSelection([]);
        setLoadingHandle(false);
        setOpenDeleteModal(false);
      },
      (error) => {
        setLoadingHandle(false);
        notification["error"]({
          message: "Thất bại",
          description: _.get(
            error,
            "error_message",
            "Xoá shipper thất bại"
          ),
        });
      }
    );
  };

  const columns = [
    {
      key: "STT",
      title: "STT",
      ellipsis: true,
      width: 100,
      render: (text, record, index) => {
        return ((pageIndex - 1) * pageSize + index + 1) < 10 ? `0${((pageIndex - 1) * pageSize + index + 1)}` : ((pageIndex - 1) * pageSize + index + 1)
      }
    },
    {
      key: "active",
      title: "Hoạt động",
      align: 'center',
      width: 200,
      ellipsis: true,
      render: (record) => {
        let className;
        if (record?.shipper_status?.code === "READY") {
          className = "radio-active";
        }

        if (record?.shipper_status?.code === "BLOCKED") {
          className = "radio-unactive";
        }

        if (record?.shipper_status?.code === "STOP") {
          className = "radio-stopactive";
        }
        return (
          <>
            <div>
              <Radio
                checked={true}
                className={className}
              />
            </div>
          </>
        )
      }
    },
    {
      key: "avatar",
      title: "Avatar",
      width: 200,
      ellipsis: true,
      render: (text, record) =>
      (
        <div>
          {
            <Avatar
              alt="avatar"
              src={process.env.REACT_APP_S3_GATEWAY + _.get(record, "avatar.url")}
            /> ??
            <Avatar alt="avatar">T</Avatar>
          }

        </div>
      )
    },
    {
      key: "code",
      title: "Mã số shipper",
      ellipsis: true,
      width: 200,
      render: (record) => <div>{_.get(record, "code")}</div>,
    },
    {
      key: "full_name",
      title: "Tên shipper",
      ellipsis: true,
      width: 200,
      render: (text, record) => <div>{record.full_name || "-"}</div>,
    },
    {
      key: "license_plate",
      title: "Biển số xe",
      ellipsis: true,
      width: 200,
      render: (text, record) => <div>{record.license_plate || "-"}</div>,
    },
    {
      key: "phone",
      title: "Số điện thoại",
      ellipsis: true,
      width: 200,
      render: (text, record) => <div>{record.phone || "-"}</div>,
    },
    {
      key: "personalid",
      title: "CMND/CCCD",
      ellipsis: true,
      width: 250,
      render: (text, record) => <div>{record.personalid || "-"}</div>,
    },
    {
      key: "time_active",
      title: "Thời gian làm việc",
      ellipsis: true,
      width: 250,
      render: (text, record) => {
        let from = "";
        let to = "";
        let result;
        if (!_.isEmpty(_.get(_.last(_.get(record, "work_shifts")), "shift_time_from"))) {
          from = _.split(_.get(_.last(_.get(record, "work_shifts")), "shift_time_from"), ":");
        }

        if (!_.isEmpty(_.get(_.last(_.get(record, "work_shifts")), "shift_time_to"))) {
          to = _.split(_.get(_.last(_.get(record, "work_shifts")), "shift_time_to"), ":");
        }

        result = `${from !== "" ? from[0] + ":" : ""}${from !== "" ? from[1] + " - " : ""}${to !== "" ? to[0] + ":" : ""}${to !== "" ? to[1] : ""}`

        return <div>
          {result || "-"}
        </div>
      }
    },
    {
      key: "rating_reviews",
      title: "Đánh giá",
      ellipsis: true,
      width: 200,
      render: (text, record) => {
        let sum = 0;
        let lengthArray = Number(_.size(_.get(record, "rating_reviews")));
        _.forEach(
          _.get(record, "rating_reviews"),
          (item) => (sum += item.star)
        );
        return (Number(sum) / lengthArray).toFixed(2) === "NaN"
          ? <div>-</div>
          : <div>{(Number(sum) / lengthArray).toFixed(2)}</div>
      },
    },
    {
      key: "booth_shippers",
      title: "Xe hàng",
      width: 250,
      ellipsis: true,
      render: (record) => {
        let result = _.map(
          record.booth_shippers,
          (item) => <span onClick={(e) => {
            e.stopPropagation();
            history.push(`/booths/detail/${item.boothByBooth.id}`)
          }}><a>{item.boothByBooth.code}</a></span>
        );

        result = result.length > 0 && result.reduce((prev, curr) => [prev, ', ', curr])
        return (
          <Tooltip title={result}>
            <div
              className={"booth_incharse"}
            >
              {result}
            </div>
          </Tooltip>

        );
      },
    }
  ];

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setRowSelection(selectedRowKeys);
    // setSelectedRows(selectedRows);
  };

  return (
    <div className={clsx(style.shipperPage, "shipperPage")}>
      <WarningModal
        onSubmit={deleteShipperHandle}
        title="Thông báo"
        content="Bạn có muốn xóa thông tin shipper khỏi hệ thống?"
        onBack={() => setOpenDeleteModal(false)}
        visible={openDeleteModal}
        loading={loadingHandle}
      />
      <Row justify="space-between" style={{ marginBottom: 24 }}>
        <Title level={3}>Quản lý shipper</Title>
        <Button
          icon={<PlusOutlined />}
          onClick={() => history.push("/shipper/create")}
          className={clsx(style.buttonRegister)}
        >
          Đăng ký
        </Button>
      </Row>

      <Wrapper>
        <Row justify="space-between">
          <Col span={12}>
            <Row gutter={16}>
              <Col className="gutter-row" span={12}>
                <Input
                  prefix={<SearchOutlined className="site-form-item-icon" />}
                  placeholder="Tìm kiếm"
                  style={{ width: "100%", height: 38 }}
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setSkip(0);
                    setPageIndex(1);
                  }}
                />
              </Col>
              <Col flex={1} className="gutter-row" span={12}>
                <Select allowClear size="large" placeholder="Hoạt động" style={{ width: '100%' }} value={shipperStatus} onChange={(value) => setShipperStatus(value)}>
                  {
                    _.map(shipperStatusList, item => {
                      return (
                        <Option value={item.code}>
                          {item.name}
                        </Option>
                      )
                    })
                  }
                </Select>
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row justify="end">
              <Button onClick={() => setOpenDeleteModal(true)} disabled={_.isEmpty(rowSelection)} className={style.buttonDelete}>Xoá</Button>
            </Row>
          </Col>
        </Row>
        <Row>
          <Table
            rowSelection={{
              selectedRowKeys: rowSelection,
              onChange: onSelectChange,
              preserveSelectedRowKeys: true,

            }}
            dataSource={data}
            rowKey="id"
            columns={columns}
            pagination={false}
            loading={loading}
            scroll={{ x: 1200 }}
            onRow={(record) => {
              return {
                style: {
                  cursor: 'pointer'
                },
                onClick: (event) => {

                  history.push(`/shipper/detail/${_.get(record, 'id')}`)
                }
              }

            }}
          />
        </Row>
        <Row justify="center">
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
            pagename="SHIPPER"
          />
        </Row>
      </Wrapper>
    </div>
  );
};

export default Shipper;
