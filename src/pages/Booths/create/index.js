import React, { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Input,
  Button,
  Form,
  Select,
  Tag,
  Space,
  notification,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import style from "../style.module.scss";
import clsx from "clsx";
import {
  useGetProvinces,
  useGetDistricts,
  useGetWards,
} from "../../../graphql/schemas/masterdata/address/query";
import _, { filter } from "lodash";
import Wrapper from "../../../components/Wrapper/Wrapper";

import { ReactComponent as NotFoundAddressIcon } from "../../../assets/icons/booths/notFoundAddress.svg";

import uuid from "react-uuid";
import slugs from "../../../constant/slugs";
import { useCreateBooth } from "../hooks";
import SuccessModal from "../../../components/Modal/SuccessModal";
import { useGetBoothExist } from "../../../graphql/schemas/hook";
import { useDebounce } from "use-debounce";

const { Text, Title } = Typography;
const { Option } = Select;

const { useForm, Item: FormItem } = Form;

const validPhone = new RegExp(/^[0-9\-\+]{9,15}$/);

const BoothCreate = () => {
  const history = useHistory();
  const [form] = useForm();

  const [bothSupport, setBothSupport] = useState([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const [name, setName] = useState("");
  const [valueName] = useDebounce(name, 1000);

  const [phone, setPhone] = useState({
    inputValue: "",
    editInputIndex: -1,
    editInputValue: "",
  });

  const [tagsPhone, setTagsPhone] = useState([]);

  const existItem = useGetBoothExist({ searchText: valueName });

  const createBooth = useCreateBooth();

  // address
  const [province, setProvince] = useState(0);
  const [district, setDistrict] = useState(0);
  const [ward, setWard] = useState([]);

  const provinceList = useGetProvinces();
  const districtList = useGetDistricts({
    provinceId: _.get(JSON.parse(province), "id"),
  });
  const wardList = useGetWards({
    districtId: _.get(JSON.parse(district), "id"),
  });

  const removeTag = (e, tag, key) => {
    e.preventDefault();
    const filtered = _.filter(bothSupport, (item, index) => item.id !== tag.id);
    setBothSupport(filtered);
  };

  const addFieldSupport = (ward) => {
    let parseProvince = JSON.parse(province);
    let parseDistrict = JSON.parse(district);
    let temp = _.cloneDeep(bothSupport);

    _.forEach(ward, (item) =>
      temp.push({
        id: uuid(),
        province: parseProvince,
        ward: JSON.parse(item),
        district: parseDistrict,
      })
    );

    let filteredDataUnique = temp.reduce((unique, o) => {
      if (!unique.some((obj) => obj.ward.id === o.ward.id)) {
        unique.push(o);
      }
      return unique;
    }, []);

    setBothSupport(filteredDataUnique);
  };

  const returnedTag = (list) => {
    return _.map(list, (item, index) => {
      return (
        <Tag
          key={index}
          className={clsx(style.tag)}
          closable
          onClose={(e) => removeTag(e, item, index)}
        >
          {_.join(
            _.pull(
              [
                _.get(item, "province.name", ""),
                _.get(item, "district.name", ""),
                _.get(item, "ward.name", ""),
              ],
              "",
              null
            ),
            ", "
          )}
        </Tag>
      );
    });
  };

  const handleWard = (value) => {
    setWard(value);
    addFieldSupport(value);
  };

  const onFinish = (values) => {
    setLoadingSubmit(true);
    let incharges = [];

    if (_.isEmpty(ward) || ward === 0) {
      incharges = _.map(wardList, item => {
        return {
          province: _.get(JSON.parse(province), 'id'),
          ward: _.get(item, "id"),
          district: _.get(JSON.parse(district), 'id'),
        }
      })
    } else {
      incharges = _.map(bothSupport, (item) => {
        return {
          province: _.get(item, "province.id"),
          ward: _.get(item, "ward.id"),
          district: _.get(item, "district.id"),
        };
      });
    }

    let params = {
      name: values.name,
      phone_numbers: tagsPhone,
      incharges,
    };

    createBooth({
      variables: {
        data: params,
      },
    }).then(
      () => {
        setSuccessModal(true);
        setLoadingSubmit(false);
        form.resetFields();
        setPhone((prev) => ({ ...prev, inputValue: "" }));
        setBothSupport([]);
      },
      (error) => {
        setLoadingSubmit(false);
        notification["error"]({
          message: "Thất bại",
          description: _.get(
            error,
            "message",
            "Tạo kho hàng lưu động thất bại"
          ),
        });
      }
    );
  };

  const handleInputChange = (e) => {
    setPhone((prev) => ({ ...prev, inputValue: e.target.value }));
  };

  const handleInputConfirm = (e) => {
    e.preventDefault();
    let { inputValue } = phone;
    let temp = _.cloneDeep(tagsPhone);
    if (inputValue && !validPhone.test(inputValue)) {
      return;
    }
    if (inputValue && tagsPhone.indexOf(inputValue) === -1) {
      temp.push(inputValue);
    }

    setTagsPhone(temp);
    setPhone((prev) => ({ ...prev, inputValue: "" }));
  };

  const saveInputRef = useRef(null);

  const removeTagPhone = (item) => {
    const removedTagList = _.filter(
      tagsPhone,
      (element) => element.id !== item.id
    );
    setTagsPhone(removedTagList);
  };

  const keyPress = (e) => {
    if (e.charCode === 32) {
      handleInputConfirm(e);
    }
  };

  return (
    <div className={clsx(style.customerPage)}>
      <Form onFinish={onFinish}>
        <SuccessModal
          onSuccess={() => history.push(slugs.booth)}
          visible={successModal}
          title="Thành công"
          content="Tạo kho hàng lưu động thành công"
        />
        <Row style={{ marginBottom: 24 }}>
          <div className={clsx(style.boxTitleCreate)}>
            <Title level={3}>Tạo kho hàng lưu động</Title>
            {/* <ArrowBack style={{ cursor: 'pointer' }} onClick={() => history.push('/booths')} /><Title level={3}>Tạo kho hàng lưu động</Title> */}
          </div>
        </Row>
        <Wrapper>
          <Row align="middle">
            <Col span={2} style={{ height: 48 }}>
              <Text className="input-label">
                Số xe <span style={{ color: "red" }}>*</span>
              </Text>
            </Col>
            <Col span={22}>
              <FormItem
                style={existItem && { marginBottom: 0 }}
                name="name"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) {
                        return Promise.reject(
                          new Error("Số xe không được để trống")
                        );
                      } else {
                        return Promise.resolve();
                      }
                    },
                  }),
                ]}
              >
                <Input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  allowClear
                  placeholder="Thông tin số xe"
                  className={clsx(style.input)}
                />
              </FormItem>
              {existItem && (
                <span className="ant-form-item-explain-error">
                  Số xe đã tồn tại
                </span>
              )}
            </Col>
          </Row>
          <Row align="middle" style={{ marginBottom: 24 }}>
            <Col span={2} className={clsx(style.phoneTitle)}>
              <Text className="input-label">
                Số điện thoại <span style={{ color: "red" }}>*</span>{" "}
              </Text>
            </Col>
            <Col span={22}>
              <FormItem
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) {
                        return Promise.reject(
                          new Error("Số điện thoại không được để trống")
                        );
                      } else if (!validPhone.test(value) && value) {
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
                style={{ marginBottom: 0 }}
              >
                <div className={clsx(style.tagPhone)}>
                  <Row align="middle">
                    <Col flex="auto">
                      {_.map(tagsPhone, (item) => (
                        <Space size={2}>
                          <Tag
                            key={item.id}
                            closable
                            onClose={() => removeTagPhone(item)}
                            className={clsx(style.tagPhoneItem)}
                          >
                            {item}
                          </Tag>
                        </Space>
                      ))}
                    </Col>
                    <Col flex="auto">
                      <Input
                        ref={saveInputRef}
                        placeholder="Nhập số điện thoại, phân cách bởi khoảng trắng"
                        value={phone.inputValue}
                        style={{
                          border: "none",
                          boxShadow: "none",
                          width: "100%",
                        }}
                        type="text"
                        onBlur={handleInputConfirm}
                        onPressEnter={handleInputConfirm}
                        onChange={handleInputChange}
                        onKeyPress={keyPress}
                      />
                    </Col>
                  </Row>
                </div>
              </FormItem>
            </Col>
          </Row>
          <Row align="middle" style={{ marginBottom: 24 }}>
            <Col span={2}>
              <Text className="input-label">
                Khu vực hỗ trợ <span style={{ color: "red" }}>*</span>
              </Text>
            </Col>
            <Col span={22}>
              <Row gutter={12}>
                <Col flex="auto">
                  <Select
                    value={province}
                    placeholder="Chọn tỉnh thành phố"
                    onChange={(value) => {
                      setProvince(value);
                      setWard([]);
                      setDistrict(0);
                    }}
                    style={{ display: "block" }}
                  >
                    <Option value={0} disabled={true}>
                      Chọn tỉnh thành phố
                    </Option>
                    {_.map(provinceList, (item) => {
                      return (
                        <Option key={item.id} value={JSON.stringify(item)}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select>
                </Col>
                <Col flex="auto">
                  <Select
                    value={district}
                    placeholder="Chọn quận huyện"
                    style={{ display: "block" }}
                    onChange={(value) => {
                      setDistrict(value);
                      setWard([]);
                    }}
                  >
                    <Option value={0} disabled={true}>
                      Chọn quận huyện
                    </Option>
                    {_.map(districtList, (item) => {
                      return (
                        <Option key={item.id} value={JSON.stringify(item)}>
                          {item.name}
                        </Option>
                      );
                    })}
                  </Select>
                </Col>
                <Col flex="auto">
                  <FormItem
                    name="ward"
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      value={ward}
                      placeholder="Chọn phường xã"
                      mode="multiple"
                      style={{ display: "block" }}
                      onChange={handleWard}
                      maxTagCount={3}
                      allowClear={true}
                    >
                      <Option value={0} disabled={true}>
                        Chọn phường xã
                      </Option>
                      {_.map(wardList, (item) => {
                        return (
                          <Option key={item.id} value={JSON.stringify(item)}>
                            {item.name}
                          </Option>
                        );
                      })}
                    </Select>
                  </FormItem>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={2}></Col>
            <Col span={22}>
              <div
                className={clsx(
                  _.size(bothSupport) === 0 && style.notFoundAddressSupport,
                  style.supportAddress
                )}
              >
                {_.size(bothSupport) === 0 ? (
                  <NotFoundAddressIcon />
                ) : (
                  <Row style={{ height: 500, overflow: "scroll" }}>
                    <Col flex="auto">{returnedTag(bothSupport)}</Col>
                  </Row>
                )}
              </div>
            </Col>
          </Row>
          <Row justify="end" style={{ marginTop: 24 }}>
            <Space>
              <Button
                onClick={() => history.push(slugs.booth)}
                className={clsx(style.buttonCancel, style.button)}
              >
                Hủy
              </Button>
              <Button
                htmlType="submit"
                loading={loadingSubmit}
                disabled={loadingSubmit}
                className={clsx(style.buttonConfirm, style.button)}
              >
                Xác nhận
              </Button>
            </Space>
          </Row>
        </Wrapper>
      </Form>
    </div>
  );
};

export default BoothCreate;
