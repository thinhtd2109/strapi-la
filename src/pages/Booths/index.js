import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Input,
  Button,
  Select,
  Table,
  Space,
  notification,
  Tag,
} from "antd";
import style from "./style.module.scss";
import clsx from "clsx";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import Wrapper from "../../components/Wrapper/Wrapper";
import { PAGE_INDEX, PAGE_SIZE } from "../../constant/info";
import {
  useGetProvinces,
  useGetDistricts,
  useGetWards,
} from "../../graphql/schemas/masterdata/address/query";
import _ from "lodash";

import { ReactComponent as DeleteIcon } from "../../assets/icons/deleteIcon.svg";
import { ReactComponent as EditIcon } from "../../assets/icons/editIcon.svg";
import { useDeleteBooth, useGetListBooth } from "./hooks";

import PaginationComponent from "../../components/PaginationComponent";
import WarningModal from "../../components/Modal/WarningModal";

import { useDebounce } from "use-debounce";

const { Text, Title } = Typography;
const { Option } = Select;

const Booths = () => {
  const history = useHistory();
  const [searchText, setSearchText] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [idDelete, setIdDelete] = useState();

  const [value] = useDebounce(searchText, 1000);

  // address
  const [provinceId, setProvinceId] = useState(0);
  const [districtId, setDistrictId] = useState(0);
  const [wardId, setWardId] = useState(0);

  const [loadingDelete, setLoadingDelete] = useState(false);

  const deleteBooth = useDeleteBooth();

  const [pageIndex, setPageIndex] = useState(PAGE_INDEX);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [skip, setSkip] = useState(0);

  const {
    data: boothList,
    loading,
    total,
    refetch,
  } = useGetListBooth({
    searchText: _.trim(value),
    province: provinceId,
    district: districtId,
    ward: wardId,
    skip,
    take: pageSize,
  });

  const provinceList = useGetProvinces();
  const districtList = useGetDistricts({ provinceId });
  const wardList = useGetWards({ districtId });

  useEffect(() => {
    if (districtId === 0) {
      setWardId(0);
    }
  }, [districtId]);

  const statusBooth = (dataRow) => {
    let active = dataRow.active;
    return active ? (
      <Tag
        className={clsx(style.tagColumn, style.tagActiveStatus)}
      >
        Đang hoạt động
      </Tag>
    ) : (
      <Tag
        className={clsx(style.tagColumn, style.tagPendingStatus)}
      >
        Đã ngừng bán
      </Tag>
    );
  };

  const columns = [
    {
      key: "STT",
      title: "STT",
      render: (text, record, index) => {
        return (
          <span className="item-center">
            {(pageIndex - 1) * pageSize + index + 1}
          </span>
        );
      },
    },
    {
      key: "code",
      title: "Trạng thái",
      render: (text, record, index) => {
        return statusBooth(record);
      },
    },
    {
      key: "code",
      title: "Mã",
      render: (text, record, index) => {
        return (
          <div>
            {record.code || "-"}
          </div>
        );
      },
    },
    {
      key: "name",
      title: "Số xe",
      render: (text, record, index) => {
        return (
          <div>
            {record.name || "-"}
          </div>
        );
      },
    },
    {
      key: "phone",
      title: "Số điện thoại",
      render: (text, record, index) => {
        let listBooth = _.map(record.booth_accounts, (item) =>
          _.replace(_.get(item, "account.phone"), "+84", "0")
        );
        return (
          <div>
            {_.join(listBooth, ", ") || "-"}
          </div>
        );
      },
    },
    {
      key: "booth_incharse",
      title: "Khu vực hỗ trợ",
      render: (text, record, index) => {
        const grouped = _.groupBy(
          record.booth_incharges,
          (address) => address.district.name
        );
        let keys = Object.keys(grouped);
        let result = _.map(keys, (item, index) => {
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
                (!_.isEmpty(keys[index + 1]) ? ", " : "")}
            </span>
          );
        });

        return (
          <div className={clsx(style.booth_incharse)}>
            {result}
          </div>
        );
      },
    },
    {
      key: "aciton",
      title: "-",
      render: (record) => {
        return (
          <Space>
            <EditIcon
              style={{ cursor: "pointer" }}
              onClick={() =>
                history.push(`/booths/edit/${_.get(record, "id")}`)
              }
            />
            <DeleteIcon
              onClick={() => {
                setOpenDeleteModal(true);
                setIdDelete(_.get(record, "id"));
              }}
              style={{ cursor: "pointer" }}
            />
          </Space>
        );
      },
    },
  ];

  const deleteBoothHandle = () => {
    setLoadingDelete(true);
    deleteBooth({
      variables: {
        id: idDelete,
      },
    }).then(
      () => {
        refetch();
        setLoadingDelete(false);
        setOpenDeleteModal(false);
      },
      (error) => {
        setLoadingDelete(false);
        notification["error"]({
          message: "Thất bại",
          description: _.get(error, "error_message", "Xoá xe hàng thất bại"),
        });
      }
    );
  };

  return (
    <div className={clsx(style.customerPage)}>
      <WarningModal
        loading={loadingDelete}
        onSubmit={deleteBoothHandle}
        title="Thông báo"
        content="Bạn muốn xoá thông tin xe hàng?"
        onBack={() => setOpenDeleteModal(false)}
        visible={openDeleteModal}
      />
      <Row justify="space-between" style={{ marginBottom: 24 }}>
        <Title level={3}>Kho hàng lưu động</Title>
        <Button
          icon={<PlusOutlined />}
          onClick={() => history.push("/booths/create")}
          className={clsx(style.buttonRegister)}
        >
          Đăng ký
        </Button>
      </Row>

      <Wrapper>
        <Row align="middle">
          <Col span={6}>
            <Input
              prefix={<SearchOutlined className="site-form-item-icon" />}
              placeholder="Tìm kiếm"
              style={{ width: "90%", height: 38, marginTop: 12 }}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setSkip(0);
                setPageIndex(1);
              }}
            />
          </Col>
          <Col span={18}>
            <Row gutter={[16, 16]} justify="end">
              <Col span={6}>
                <Text className={clsx(style.title)}>Tỉnh / TP</Text>
                <Select
                  onChange={(value) => {
                    setProvinceId(value);
                    setDistrictId(0);
                  }}
                  style={{ display: "block" }}
                  value={provinceId}
                >
                  <Option disabled={true} value={0}>
                    Chọn tỉnh thành phố
                  </Option>
                  {_.map(provinceList, (item) => {
                    return (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Col>
              <Col span={6}>
                <Text className={clsx(style.title)}>Quận / Huyện</Text>
                <Select
                  style={{ display: "block" }}
                  value={districtId}
                  onChange={(value) => {
                    setDistrictId(value);
                    setWardId(0);
                  }}
                >
                  <Option disabled={true} value={0}>
                    Chọn quận huyện
                  </Option>
                  {_.map(districtList, (item) => {
                    return (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Col>
              <Col span={6}>
                <Text className={clsx(style.title)}>Phường / xã</Text>
                <Select
                  style={{ display: "block" }}
                  value={wardId}
                  onChange={(value) => setWardId(value)}
                >
                  <Option disabled={true} value={0}>
                    Chọn phường xã
                  </Option>
                  {_.map(wardList, (item) => {
                    return (
                      <Option key={item.id} value={item.id}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={clsx(style.wrapperTable)}>
          <Table
            dataSource={boothList}
            rowKey="id"
            columns={columns}
            pagination={false}
            loading={loading}
            onRow={(record) => {
              return {
                style: {
                  cursor: 'pointer'
                },
                onClick: () => history.push("/booths/detail/" + record.id)
              }
            }}
          />

          <PaginationComponent
            total={total}
            pageSize={pageSize}
            pageIndex={pageIndex}
            pageSizeOptions={[10, 20, 40, 80, 120]}
            setPageSize={setPageSize}
            setPageIndex={(index) => {
              setPageIndex(index);
              setSkip(index * pageSize - pageSize);
            }}
            pagename="BOOTHS"
          />
        </Row>
      </Wrapper>
    </div>
  );
};

export default Booths;
