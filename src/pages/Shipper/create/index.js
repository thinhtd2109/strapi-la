import React, { Fragment, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import style from "../style.module.scss";
import "../style.scss";
import {
  Row,
  Typography,
  Avatar,
  Col,
  Space,
  Input,
  Button,
  Form,
  Select,
  notification,
  Upload,
  message,
  TimePicker,
  Tag,
} from "antd";
import _ from "lodash";
import clsx from "clsx";
import Wrapper from "../../../components/Wrapper/Wrapper";
import { ReactComponent as UploadIcon } from "../../../assets/icons/shipper/uploadImageButton.svg";
import axios from "axios";
import {
  useGetListBooths,
  useCreateShipper,
  useGetListInfoBooths,
} from "../../../graphql/schemas/hook";
import SuccessModal from "../../../components/Modal/SuccessModal";
import { LoadingOutlined } from "@ant-design/icons";
import slugs from "../../../constant/slugs";
import { useGetSettings } from "../../Settings/hooks";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = TimePicker;

const validPhone = new RegExp(/^[0-9\-\+]{9,15}$/);

const ShipperCreate = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const { data: boothList } = useGetListBooths();
  const [booths, setBooths] = useState([]);
  const { useForm, Item: FormItem } = Form;
  const [image, setImage] = useState([]);
  const [errorUpload, setErrorUpload] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);
  const [form] = useForm();
  const { createShipper, loading: createLoading } = useCreateShipper();
  const { data: infoBoothsList, loading: loadingInfoBooths } = useGetListInfoBooths({ booths });

  const { data: settings } = useGetSettings();

  const handleUploadImage = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    formData.append("media_type_code", "PHOTO");

    setLoading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const { data } = await axios.post(
        process.env.REACT_APP_BASEURL_UPLOAD,
        formData,
        config
      );
      setImage(data[0]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const onFinished = (values) => {
    setLoadingSubmit(true);
    if (_.isUndefined(image) || _.isEmpty(image)) {
      setErrorUpload("Hình ảnh không được để trống");
      return;
    }

    createShipper({
      variables: {
        data: {
          name: values.name,
          phone: values.phone,
          personalid: values.personalid,
          avatar: _.get(image, "id"),
          license_plate: values.license_plate,
          booths: _.map(infoBoothsList, item => item.id),
          work_shifts: _.map(values.work_shifts, item => {
            let data = _.split(item, "-");
            return {
              shift_time_from: _.trim(data[0]),
              shift_time_to: _.trim(data[1])
            }
          })
        },
      },
    }).then(
      (res) => {
        setLoadingSubmit(false);
        setModalSuccess(true);
      },
      (error) => {
        setLoadingSubmit(false);
        notification["error"]({
          message: "Thất bại",
          description: _.get(error, 'message', "Đăng ký xe hàng thất bại"),
        });
      }
    );
  };
  const onFinishFailed = () => {
    if (_.isUndefined(image)) {
      setErrorUpload("Hình ảnh không được để trống");
    }
  };

  function beforeUpload(file) {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg" ||
      file.type === "image/svg+xml";
    setImage(null);
    if (isJpgOrPng === false) {
      message.error("Vui lòng chọn hình ảnh");
    }
    // const isLt2M = file.size / 1024 / 1024 < 2;
    // if (!isLt2M) {
    //   message.error('Image must smaller than 2MB!');
    // }
    return isJpgOrPng;
  }

  function tagRender(props) {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = event => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        style={{ marginRight: 3, borderRadius: 6 }}
      >
        {label[0]}
      </Tag>
    );
  }

  return (
    <Fragment>
      <SuccessModal
        onSuccess={() => history.push("/shipper")}
        visible={modalSuccess}
        title="Thành công"
        content="Đăng ký shipper thành công"
      />
      <Form onFinishFailed={onFinishFailed} onFinish={onFinished} form={form}>
        <div className={clsx(style.shipperDetailWrapper)}>
          <Row justify="space-between" style={{ marginBottom: 24 }}>
            <Title level={3}>Đăng ký thông tin shipper</Title>
          </Row>
          <Wrapper>
            <Row>
              <Col xs={4}>
                <FormItem
                  rules={[
                    { required: true, message: "Hình ảnh không được để trống" },
                  ]}
                  name="photos"
                  className={style.formItem}
                >
                  <Space
                    direction="vertical"
                    align="center"
                    size={16}
                    style={{ width: 219 }}
                  >
                    {loading ? (
                      <LoadingOutlined />
                    ) : (
                      <Fragment>
                        {_.isEmpty(image) ? (
                          <Avatar className={style.avatar} alt="avatar">
                            D
                          </Avatar>
                        ) : (
                          <Avatar
                            className={style.avatar}
                            alt="avatar"
                            src={
                              process.env.REACT_APP_S3_GATEWAY +
                              _.get(image, "url")
                            }
                          />
                        )}
                      </Fragment>
                    )}

                    <Upload
                      accept="image/*"
                      id="upload-image-shipper"
                      action={handleUploadImage}
                      beforeUpload={beforeUpload}
                      showUploadList={false}
                    >
                      <div className={clsx(style.uploadImage)}>
                        <UploadIcon fill="#FCB040" />
                        <Text className={clsx(style.uploadText)}>
                          {" "}
                          Tải hình ảnh
                        </Text>
                      </div>
                    </Upload>
                  </Space>
                </FormItem>
              </Col>
              <Col xs={10}>
                <Space direction="vertical" size={54} style={{ width: "100%" }}>
                  <Space
                    direction="vertical"
                    size={34}
                    style={{ width: "100%" }}
                  >
                    <Row align="middle">
                      <Col xs={8}>
                        <Text className="input-label">
                          Họ và tên <span style={{ color: "red" }}>*</span>
                        </Text>
                      </Col>
                      <Col xs={16}>
                        <FormItem
                          rules={[({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || value.trim() === "") {
                                return Promise.reject(
                                  new Error("Họ tên không được để trống")
                                );
                              } else {
                                return Promise.resolve();
                              }
                            },
                          })]}
                          name="name"
                          className={style.formItem}
                        >
                          <Input
                            allowClear
                            placeholder="Họ và tên"
                            className={clsx(style.input)}
                          />
                        </FormItem>
                      </Col>
                    </Row>
                    <Row align="middle">
                      <Col xs={8}>
                        <Text className="input-label">
                          Số điện thoại <span style={{ color: "red" }}>*</span>
                        </Text>
                      </Col>
                      <Col xs={16}>
                        <FormItem
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || !validPhone.test(value) || value.trim() === "") {
                                  return Promise.reject(
                                    new Error("Số điện thoại không hợp lệ")
                                  );
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                          name="phone"
                          className={style.formItem}
                        >
                          <Input
                            allowClear
                            placeholder="Số điện thoại"
                            className={clsx(style.input)}

                          />
                        </FormItem>
                      </Col>
                    </Row>
                    <Row align="middle">
                      <Col xs={8}>
                        <Text className="input-label">
                          CMND/CCCD <span style={{ color: "red" }}>*</span>
                        </Text>
                      </Col>
                      <Col xs={16}>
                        <FormItem
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                if (!value || value.trim() === "") {
                                  return Promise.reject(
                                    new Error("Chứng minh thư không được để trống")
                                  );
                                } else if (value.length > 12 || value < 0) {
                                  return Promise.reject(
                                    new Error("Chứng minh thư không hợp lệ")
                                  );
                                } else {
                                  return Promise.resolve();
                                }
                              },
                            }),
                          ]}
                          name="personalid"

                          className={style.formItem}
                        >
                          <Input
                            maxLength={12}
                            allowClear
                            placeholder="CMND/CCCD"
                            type="number"
                            className={clsx(style.input)}
                          />
                        </FormItem>
                      </Col>
                    </Row>
                    <Row align="middle">
                      <Col xs={8}>
                        <Text className="input-label">
                          Số xe <span style={{ color: "red" }}>*</span>
                        </Text>
                      </Col>
                      <Col xs={16}>
                        <FormItem
                          rules={[({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || value.trim() === "") {
                                return Promise.reject(
                                  new Error("Biển số  xe không được để trống")
                                );
                              } else {
                                return Promise.resolve();
                              }
                            },
                          })]}
                          name="license_plate"
                          className={style.formItem}
                        >
                          <Input
                            allowClear
                            placeholder="Số xe"
                            className={clsx(style.input)}
                          />
                        </FormItem>
                      </Col>
                    </Row>

                    {/* <Row align="middle">
                      <Col xs={8}>
                        <Text className="input-label">Khu vực làm việc</Text>
                      </Col>
                      <Col xs={16}>
                        <FormItem
                          rules={[
                            {
                              required: true,
                              message: "Biển số xe không được để trống",
                            },
                          ]}
                          name="license_plate"
                          className={style.formItem}
                        >
                          <Input
                            allowClear
                            placeholder="Khu vực làm việc"
                            className={clsx(style.input)}
                          />
                        </FormItem>
                      </Col>
                    </Row> */}

                  </Space>
                </Space>
              </Col>
              <Col xs={10}>
                <Space direction="vertical" size={54} style={{ width: "100%" }}>
                  <Space
                    direction="vertical"
                    size={34}
                    style={{ width: "100%" }}
                  >
                    <Row align="middle">
                      <Col xs={8}>
                        <Text style={{ marginLeft: 12 }} className="input-label">Thời gian làm việc </Text>
                      </Col>

                      <Col xs={16}>
                        <FormItem className={clsx(style.formItem, "customSelect")} name="work_shifts">
                          <Select
                            placeholder="Thời gian làm việc"
                            size="large"
                            mode="multiple"
                            tokenSeparators={[","]}
                            allowClear
                          >
                            {_.map(_.get(_.find(settings, item => item.code === "shift_time"), "shifts"), (element, index) => {
                              return <Option value={`${element.from} - ${element.to}`} key={index}>{element.from} - {element.to}</Option>
                            })}
                          </Select>
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={8}>
                        <Text style={{ marginLeft: 12 }} className="input-label">Kho hàng </Text>
                      </Col>

                      <Col xs={16}>
                        <FormItem className={clsx(style.formItem, "customSelect")} name="booths">
                          <Select
                            onChange={(value) => setBooths(value)}
                            placeholder="Kho hàng"
                            size="large"

                            mode="multiple"
                            tokenSeparators={[","]}
                            allowClear
                          >
                            {_.map(boothList, (item) => {
                              return (
                                <Option key={item.id} value={item.code}>
                                  {_.get(item, "code")}
                                </Option>
                              );
                            })}
                          </Select>
                        </FormItem>
                        <div className={clsx(style.resultBooths, style.border)}>
                          {(loadingInfoBooths && !infoBoothsList) ? (
                            <LoadingOutlined style={{ fontSize: 24 }} spin />
                          ) : (
                            <>
                              {_.map(infoBoothsList, item => {
                                if (item.booth_incharges.length > 0) {
                                  let result = _.map(item.booth_incharges, address => {
                                    return <Tag style={{ marginTop: 8 }}>{item.code} - {_.join([address.ward.name, address.district.name], ', ')}</Tag>
                                  });
                                  return result;
                                }

                                return <Tag style={{ marginTop: 8 }}>{item.code}</Tag>

                              })}
                            </>
                          )}

                        </div>
                      </Col>
                    </Row>
                  </Space>
                </Space>
              </Col>
            </Row>
          </Wrapper>
          <Row justify="end" style={{ marginTop: 24 }}>
            <Space>
              <Button
                onClick={() => history.push(slugs.shipper)}
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
        </div>
      </Form>
    </Fragment >
  );
};

export default ShipperCreate;
