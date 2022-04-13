import React, { useState, Fragment, useEffect } from "react";
import { useParams, useHistory, matchPath, useLocation } from "react-router-dom";
import style from "../style.module.scss";
import {
  Row,
  Typography,
  Space,
  Button,
  Form,
  Spin,
  Select,
  notification,
  DatePicker,
  Tabs,
} from "antd";
import _ from "lodash";
import clsx from "clsx";
import Wrapper from "./components/WrapperCusom";
import {
  useGetListBooths,
  useGetListInfoBooths,
  useGetShipper,
  useUpdateShipper,
} from "../../../graphql/schemas/hook";

import SuccessModal from "../../../components/Modal/SuccessModal";

import { PlusOutlined } from "@ant-design/icons";

import "../style.scss";
import Detail from "./Detail";
import Attendance from "./attendance";

import moment from "moment";
import OrderHistory from "./OrderHistory";
import OutOfArea from "./OutOfArea";
import HistoryReview from "./HistoryReview";
import { useGetListStatusHistory } from "../hooks";

const { Title } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const ShipperEdit = () => {
  const location = useLocation()
  const { useForm, Item: FormItem } = Form;
  const { data: boothList } = useGetListBooths();
  const [image, setImage] = useState();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [form] = useForm();
  const [initialValues, setInitialValues] = useState({});

  const [booths, setBooths] = useState([]);
  const { data: infoBoothsList, loading: loadingInfoBooths } = useGetListInfoBooths({ booths });
  const { data: statusHistoryList, loading: loadingStatusHistory, error } = useGetListStatusHistory();

  const history = useHistory();

  const [rangeDate, setRangeDate] = useState([moment().startOf('month'), moment().endOf('month')]);

  const [tabKey, setTabkey] = useState("0");

  const updateShipper = useUpdateShipper();

  const { id } = useParams();

  const isEdit = matchPath(location.pathname, { path: "/shipper/edit" })

  const {
    data: shipper,
    loading: loadingDetailShipper,
    refetch,
  } = useGetShipper({ id });

  const onFinished = (values) => {
    setLoadingSubmit(true);
    let work_shifts = values.work_shifts ? {
      work_shifts: [{
        shift_time_from: _.trim(_.split(values.work_shifts, "-")[0]),
        shift_time_to: _.trim(_.split(values.work_shifts, "-")[1]),
      }]
    } : null
    updateShipper({
      variables: {
        data: {
          id,
          name: values.full_name,
          personalid: values.personalid,
          avatar: _.get(image, "id"),
          license_plate: values.license_plate,
          booths: _.map(infoBoothsList, item => item.id),
          status: Number(values.status),
          ...work_shifts
        },
      },
    }).then(
      (res) => {
        refetch();
        setLoadingSubmit(false);
        setModalSuccess(true);
      },
      (error) => {
        setLoadingSubmit(false);
        notification["error"]({
          message: "Thất bại",
          description: _.get(
            error,
            "error_message",
            "Chỉnh sửa shipper thất bại"
          ),
        });
      }
    );
  };
  const onFinishFailed = () => { };

  const handleReviewStar = () => {
    let sum = 0;
    let lengthArray = Number(_.size(_.get(shipper, "rating_reviews")));
    _.forEach(_.get(shipper, "rating_reviews"), (item) => (sum += item.star));
    return (Number(sum) / lengthArray).toFixed(2) === "NaN"
      ? "0"
      : (Number(sum) / lengthArray).toFixed(2);
  };

  useEffect(() => {
    if (shipper) {
      let work_shifts = "";
      setImage({
        id: _.get(shipper, "avatar.id"),
        url: _.get(shipper, "avatar.url"),
      });
      if (!_.isEmpty(shipper.work_shifts)) {
        let from = _.split(_.get(shipper, "work_shifts[0].shift_time_from"), ":");
        let to = _.split(_.get(shipper, "work_shifts[0].shift_time_to"), ":");

        work_shifts = `${from[0]}:${from[1]} - ${to[0]}:${to[1]}`;
      }


      setInitialValues({
        code: _.get(shipper, "code"),
        avatar: _.get(shipper, "avatar.id"),
        full_name: _.get(shipper, "full_name"),
        phone: _.get(shipper, "phone"),
        personalid: _.get(shipper, "personalid"),
        license_plate: _.get(shipper, "license_plate"),
        booths: _.map(_.get(shipper, "booth_shippers"), (item) =>
          _.get(item, "boothByBooth.code")
        ),
        star: handleReviewStar(),
        work_shifts,
        status: _.get(shipper, "status")
      });
    }

  }, [shipper, location.pathname]);

  const returnTitle = () => {
    if (tabKey === "0" && isEdit) {
      return "Chỉnh sửa thông tin shipper"
    }
    if (tabKey === "0") {
      return "Chi tiết thông tin shipper";
    }

    if (tabKey === "1") {
      return "Lịch sử đơn hàng";
    }

    if (tabKey === "2") {
      return "Lịch sử hoạt động";
    }

    if (tabKey === "3") {
      return "Danh sách ra khỏi khu vực";
    }
  };



  if (loadingDetailShipper || _.isEmpty(initialValues) || loadingStatusHistory)
    return (
      <div className="wapperLoading">
        <Spin tip="Đang tải dữ liệu..." />
      </div>
    );

  return (
    <Fragment>
      <SuccessModal
        onSuccess={() => {
          setModalSuccess(false);
          history.push('/shipper/detail/' + id);
        }}
        visible={modalSuccess}
        title="Thành công"
        content="Chỉnh sửa shipper thành công"
      />
      <Form
        onFinishFailed={onFinishFailed}
        onFinish={onFinished}
        form={form}
        initialValues={initialValues}
      >
        <div
          className={clsx(style.shipperDetailWrapper, "shipperDetailWrapper")}
        >
          <Row justify="space-between" style={{ marginBottom: 24 }}>
            <Title level={3}>{returnTitle()}</Title>
            {!isEdit && tabKey === "0" && (
              <Button
                icon={<PlusOutlined />}
                onClick={() => history.push(`/shipper/edit/${_.get(shipper, 'id')}`)}
                className={clsx(style.buttonEditMode)}
              >
                Sửa thông tin
              </Button>
            )}
            {(tabKey === "1" || tabKey === "2" || tabKey === "3" || tabKey === "4") && (
              <RangePicker format="DD/MM/YYYY" showTime allowClear={false} onChange={(v) => { setRangeDate(v) }} value={rangeDate} placeholder={["DD/MM/YYYY", "DD/MM/YYYY"]} style={{ borderRadius: 6, height: 38 }} />
            )}
          </Row>
          <Wrapper>
            {
              <Tabs defaultActiveKey={"0"} onChange={(key) => setTabkey(key)}>
                <TabPane
                  tab={<span style={{ padding: 24 }}>Thông tin shipper</span>}
                  key="0"
                >
                  <Detail
                    loading={loading}
                    setLoading={setLoading}
                    FormItem={FormItem}
                    setImage={setImage}
                    image={image}
                    isEdit={isEdit}
                    form={form}
                    shipper={shipper}
                    boothList={boothList}
                    setBooths={setBooths}
                    infoBoothsList={infoBoothsList}
                    loadingInfoBooths={loadingInfoBooths}
                  />
                </TabPane>
                {!isEdit && (
                  <>
                    <TabPane tab="Lịch sử đơn hàng" key="1">
                      <OrderHistory statusHistoryList={statusHistoryList} shipper={_.get(shipper, "id")} to_date={rangeDate[1]} from_date={rangeDate[0]} id={id} />
                    </TabPane>
                    <TabPane tab="Lịch sử hoạt động" key="2">
                      <Attendance shipper={_.get(shipper, "id")} to_date={rangeDate[1]} from_date={rangeDate[0]} />
                    </TabPane>
                    <TabPane tab="Lịch sử ra khỏi khu vực" key="3">
                      <OutOfArea shipper={_.get(shipper, "id")} to_date={rangeDate[1]} from_date={rangeDate[0]} />
                    </TabPane>
                    <TabPane tab="Lịch sử đánh giá" key="4">
                      <HistoryReview statusHistoryList={statusHistoryList} shipper={_.get(shipper, "id")} to_date={rangeDate[1]} from_date={rangeDate[0]} id={id} />
                    </TabPane>
                  </>
                )}

              </Tabs>
            }
          </Wrapper>
          {tabKey === "0" && isEdit && (
            <Row justify="end" style={{ marginTop: 24 }}>
              <Space>
                <Button
                  onClick={() => history.push(`/shipper/detail/${_.get(shipper, 'id')}`)}

                  className={clsx(style.buttonCancel, style.button)}
                >
                  Hủy
                </Button>
                <Button
                  loading={loadingSubmit}
                  disabled={loadingSubmit}
                  htmlType="submit"
                  className={clsx(style.buttonConfirm, style.button)}
                >
                  Xác nhận
                </Button>
              </Space>
            </Row>
          )}

        </div>
      </Form>
    </Fragment>
  );
};

export default ShipperEdit;
