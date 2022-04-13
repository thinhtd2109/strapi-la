import React, { Fragment, useEffect, useState } from "react";
import {
  Row,
  Col,
  Space,
  Select,
  Typography,

  message,
  Input,
  Avatar,
  Upload,
  Tag
} from "antd";
import { useLocation } from 'react-router-dom';
import _ from "lodash";
import { ReactComponent as UploadIcon } from "../../../assets/icons/shipper/uploadImageButton.svg";
import { LoadingOutlined } from "@ant-design/icons";
import style from "../style.module.scss";

import clsx from "clsx";

import axios from "axios";
import { useGetListInfoBooths, useGetListStatusShipper } from "../../../graphql/schemas/hook";
import { useGetSettings } from "../../Settings/hooks";

const { Text } = Typography;
const { Option } = Select;

const validPhone = new RegExp(/^[0-9\-\+]{9,15}$/);

const Detail = (props) => {
  const { FormItem, setImage, isEdit, loading, image, setLoading, shipper, boothList, infoBoothsList, setBooths, loadingInfoBooths } = props;
  const location = useLocation();
  const { data: shipperStatusList } = useGetListStatusShipper();

  const { data: settings } = useGetSettings();

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
  const handleUploadImage = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    formData.append("media_type_code", "BANNER_PROMOTION");

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

  const returnedWorkShiftDetail = () => {
    let work_shifts = ""
    if (!_.isEmpty(shipper.work_shifts)) {
      let from = _.split(_.get(shipper, "work_shifts[0].shift_time_from"), ":");
      let to = _.split(_.get(shipper, "work_shifts[0].shift_time_to"), ":");

      work_shifts = `${from[0]}:${from[1]} - ${to[0]}:${to[1]}`;
    }

    return work_shifts;

  }

  useEffect(() => {
    setBooths(_.map(_.get(shipper, "booth_shippers"), (item) =>
      _.get(item, "boothByBooth.code")
    ))
  }, [location.pathname]);

  return (
    <Row style={{ padding: "24px" }}>
      <Col xs={4}>
        <FormItem
          rules={[{ required: true, message: "Hình ảnh không được để trống" }]}
          name="avatar"
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
                    src={process.env.REACT_APP_S3_GATEWAY + _.get(image, "url")}
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
              disabled={!isEdit}
            >
              <div className={clsx(style.uploadImage)}>
                <UploadIcon fill="#FCB040" />
                <Text className={clsx(style.uploadText)}> Tải hình ảnh</Text>
              </div>
            </Upload>
          </Space>
        </FormItem>
      </Col>
      <Col xs={10}>
        <Space direction="vertical" size={54} style={{ width: "100%" }}>
          <Space direction="vertical" size={34} style={{ width: "100%" }}>
            <Row align="middle">
              <Col xs={6} className={style.labelShipper}>
                <Text className={style.inputLabel}>Mã shipper <span style={{ color: "red" }}>*</span></Text>
              </Col>
              <Col xs={18}>
                {
                  !isEdit ? (
                    _.get(shipper, 'code', "-")
                  ) : (
                    <FormItem name="code">
                      <Input disabled={true} allowClear className={clsx(style.input)} />
                    </FormItem>
                  )
                }

              </Col>
            </Row>
            <Row align="middle">
              <Col xs={6} className={style.labelShipper}>
                <Text className={style.inputLabel}>
                  Họ và tên <span style={{ color: "red" }}>*</span>
                </Text>
              </Col>
              <Col xs={18}>
                {
                  !isEdit ? _.get(shipper, 'full_name', "-") : (
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
                      name="full_name"
                    >
                      <Input allowClear disabled={!isEdit} className={clsx(style.input)} />
                    </FormItem>
                  )
                }

              </Col>
            </Row>
            <Row align="middle">
              <Col xs={6} className={style.labelShipper}>
                <Text className={style.inputLabel}>
                  Số điện thoại <span style={{ color: "red" }}>*</span>
                </Text>
              </Col>
              <Col xs={18}>
                {!isEdit ? (
                  _.get(shipper, 'phone', "-")
                ) : (
                  <FormItem
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || !validPhone.test(value)) {
                            return Promise.reject(
                              new Error("Số điện thoại không hợp lệ")
                            );
                          } else {
                            return Promise.resolve();
                          }
                        },
                      }),
                    ]}
                    name="phone"
                  >
                    <Input
                      allowClear
                      placeholder="Số điện thoại"
                      disabled={true}
                      className={clsx(style.input)}
                    />
                  </FormItem>
                )}

              </Col>
            </Row>
            <Row align="middle">
              <Col xs={6} className={style.labelShipper}>
                <Text className={style.inputLabel}>
                  CMND/CCCD <span style={{ color: "red" }}>*</span>
                </Text>
              </Col>
              <Col xs={18}>
                {
                  !isEdit ? (
                    _.get(shipper, 'personalid', "-")
                  ) : (
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
                    >
                      <Input
                        allowClear
                        placeholder="CMND/CCCD"
                        disabled={!isEdit}
                        type="number"
                        className={clsx(style.input)}
                      />
                    </FormItem>
                  )
                }

              </Col>
            </Row>
            <Row align="middle">
              <Col xs={6} className={style.labelShipper}>
                <Text className={style.inputLabel}>
                  Biển số xe <span style={{ color: "red" }}>*</span>
                </Text>
              </Col>
              <Col xs={18}>
                {
                  !isEdit ? (
                    _.get(shipper, 'license_plate', "-")
                  ) : (
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
                    >
                      <Input
                        allowClear
                        placeholder="Biển số xe"

                        className={clsx(style.input)}
                      />
                    </FormItem>
                  )
                }

              </Col>
            </Row>
            {/* 
            <Row align="middle">
              <Col xs={6} className={clsx(style.labelShipper)}>
                <Text className={style.inputLabel}>Khu vực hoạt động</Text>
              </Col>
              <Col xs={18}>
                <FormItem name="time_active">
                  <Input
                    allowClear
                    disabled={!isEdit}
                    placeholder="Khu vực hoạt động"
                    className={clsx(style.input)}
                  />
                </FormItem>
              </Col>
            </Row> */}

            {!isEdit && (
              <>
                <Row align="middle">
                  <Col xs={6} className={clsx(style.labelShipper)}>
                    <Text className={style.inputLabel}>Tổng đơn</Text>
                  </Col>
                  <Col xs={18}>
                    {
                      !isEdit ? (
                        _.get(shipper, "time_active")
                      ) : (
                        <FormItem name="time_active">
                          <Input
                            allowClear

                            placeholder="Tổng đơn"
                            className={clsx(style.input)}
                          />
                        </FormItem>
                      )
                    }

                  </Col>
                </Row>
                <Row align="middle">
                  <Col xs={6} className={clsx(style.labelShipper)}>
                    <Text className={style.inputLabel}>Số lần vi phạm</Text>
                  </Col>
                  <Col xs={18}>
                    {
                      !isEdit ? _.get(shipper, "") ?? "-" : (
                        <FormItem name="">
                          <Input
                            allowClear

                            placeholder="Số lần vi phạm"
                            className={clsx(style.input)}
                          />
                        </FormItem>
                      )
                    }

                  </Col>
                </Row>
              </>
            )}
          </Space>
        </Space>
      </Col>
      <Col xs={10}>
        <Space direction="vertical" size={54} style={{ width: "100%" }}>
          <Space direction="vertical" size={34} style={{ width: "100%" }}>
            {!isEdit && (

              <Row align="middle">
                <Col xs={6} className={clsx(style.labelShipper)}>
                  <Text className={style.inputLabel}>Đánh giá shipper</Text>
                </Col>
                <Col xs={18}>

                  {_.get(shipper, "star") ?? "-"}
                  {/* <FormItem name="star">
                    <Input
                      allowClear
                      disabled={!isEdit}
                      placeholder="Đánh giá shipper"
                      className={clsx(style.input)}
                    />
                  </FormItem> */}
                </Col>
              </Row>
            )}
            <Row align="middle">
              <Col xs={6} className={clsx(style.labelShipper, style.rightSideCaption)}>
                <Text className={style.inputLabel}>Trạng thái </Text>
              </Col>
              <Col xs={18}>
                {!isEdit ? (
                  _.find(shipperStatusList, item => item.id === _.get(shipper, "status"))?.name ?? "-"
                ) : (
                  <FormItem style={{ marginBottom: 24 }} className="customSelect" name="status">
                    <Select
                      placeholder="Chọn hoạt động"
                      size="large"
                      allowClear
                      disabled={!isEdit}
                    >
                      {_.map(shipperStatusList, item => {
                        return <Option value={item.id}>{item.name}</Option>
                      })}
                    </Select>
                  </FormItem>
                )}

              </Col>
            </Row>
            <Row align="middle">
              <Col xs={6} className={clsx(style.labelShipper, style.rightSideCaption)}>
                <Text className={style.inputLabel}>Thời gian làm việc</Text>
              </Col>
              <Col xs={18}>
                {!isEdit ? returnedWorkShiftDetail() : (
                  <FormItem name="work_shifts">
                    <Select
                      placeholder="Chọn thời gian làm việc"
                      size="large"
                      allowClear
                      disabled={!isEdit}
                      className="customSelect"
                    >
                      {_.map(_.get(_.find(settings, item => item.code === "shift_time"), "shifts"), (element, index) => {
                        return <Option value={`${element.from} - ${element.to}`} key={index}>{element.from} - {element.to}</Option>
                      })}
                    </Select>
                  </FormItem>
                )}

              </Col>
            </Row>
            <Row>
              <Col xs={6} className={clsx(style.labelShipper, style.rightSideCaption)}>
                <Text className={style.inputLabel}>Kho hàng </Text>
              </Col>
              <Col xs={18}>
                {!isEdit ? (
                  <>
                    {_.map(infoBoothsList, item => {
                      return <Tag style={{ marginTop: 8 }}>{item.code}</Tag>
                    })}
                  </>
                ) : (
                  <FormItem className="customSelect" style={{ marginBottom: 24 }} name="booths">
                    {boothList && (
                      <Select
                        size="large"
                        allowClear
                        onChange={(value) => setBooths(value)}
                        disabled={!isEdit}
                        mode="multiple"
                        tokenSeparators={[","]}
                        placeholder="Kho hàng"
                      >
                        {_.map(boothList, (item) => {
                          return (
                            <Option key={item.id} value={item.code}>
                              {_.get(item, "code")}
                            </Option>
                          );
                        })}
                      </Select>
                    )}

                  </FormItem>
                )}
                <div className={clsx(style.resultBooths, isEdit && style.border)}>
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
  );
};

export default Detail;
