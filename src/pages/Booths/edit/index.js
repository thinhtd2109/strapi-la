import React, { useState, useRef, useEffect, Fragment } from "react";
import { useHistory, useParams } from "react-router-dom";
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
  Spin,
  notification,
  InputNumber,
  Image,
  Divider,
  Table,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import Vector from "../../../assets/icons/Vector.svg";
import NoImage from "./../../../assets/images/no-image.svg";

import style from "../style.module.scss";
import clsx from "clsx";
import {
  useGetProvinces,
  useGetDistricts,
  useGetWards,
} from "../../../graphql/schemas/masterdata/address/query";
import _ from "lodash";
import Wrapper from "../../../components/Wrapper/Wrapper";

import { ReactComponent as NotFoundAddressIcon } from "../../../assets/icons/booths/notFoundAddress.svg";
import { ReactComponent as ArrowBack } from "../../../assets/icons/ArrowBack.svg";

import uuid from "react-uuid";
import slugs from "../../../constant/slugs";
import { useGetBooth, useUpdateBooth } from "../hooks";
import SuccessModal from "../../../components/Modal/SuccessModal";
import { useGetBoothExist } from "../../../graphql/schemas/hook";
import { useDebounce } from "use-debounce";
import { GET_BOOTH_PRODUCT_LIST } from "../../../graphql/schemas/booths/query";
import { useQuery } from "@apollo/client";
import { formatMoney } from "../../../helpers";
import moment from "moment";
import ProductCheckingComponent from "../detail/ProductsCheking";
import UploadModal from "../../../components/Modal/UploadModal";

const { useForm, Item: FormItem } = Form;

const { Text, Title } = Typography;
const { Option } = Select;

const validPhone = new RegExp(/^[0-9\-\+]{9,15}$/);

const BoothEdit = () => {
  const history = useHistory();
  const [form] = useForm();
  const { id } = useParams();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [rowSelection, setRowSelection] = useState([]);
  const [isUpload, setIsUpload] = useState(false);
  const [bothSupport, setBothSupport] = useState([]);
  /*
    0: Detail list
    1: Checking product list
    */
  const [state, setState] = useState(0);
  const [productList, setProductList] = useState([]);
  const [otherProductList, setOtherProductList] = useState([]);

  const [initialValues, setInitialValues] = useState();

  const [name, setName] = useState("");
  const [valueName] = useDebounce(name, 1000);

  const existItem = useGetBoothExist({ searchText: valueName });
  const { data, loading } = useQuery(GET_BOOTH_PRODUCT_LIST, {
    variables: {
      boothId: id,
    },
  });

  // address
  const [province, setProvince] = useState(0);
  const [district, setDistrict] = useState(0);
  const [ward, setWard] = useState([]);

  //Columns
  const columns = [
    {
      title: <div style={{ color: "#EF4036" }}>Chọn sản phẩm cần xóa</div>,
      dataIndex: "id",
      key: "id",
      width: 550,
      ellipsis: true,
      render: (_, record) => {
        return (
          <div className="flex align-center h-max">
            <Space size={12}>
              {record?.productPricingByProductPricing?.productByProduct?.photo
                ?.url !== undefined ? (
                <Image
                  className="productImage"
                  src={
                    process.env.REACT_APP_S3_GATEWAY +
                    record?.productPricingByProductPricing?.productByProduct?.photo
                      ?.url
                  }
                  alt="product_image"
                />
              ) : (
                <Image src={NoImage} />
              )}

              <div className="flex flex-column">
                <Text style={{ fontSize: "20px" }}>
                  {record?.productPricingByProductPricing?.productByProduct?.name}
                </Text>
                <Text>
                  Giá:{" "}
                  <Text className="red">
                    {formatMoney(record.productPricingByProductPricing.price)} đ
                  </Text>
                </Text>
                <Text>
                  Mã sản phẩm:{" "}
                  {record.productPricingByProductPricing?.productByProduct?.code}
                </Text>
                <Text>
                  Mã phân loại:{" "}
                  {record.productPricingByProductPricing?.product_sku?.sku}
                </Text>
              </div>
            </Space>
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "product_type",
      key: "product_type",
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        return (
          <div className={style.titleWrapper}>
            <div className={style.titleProduct}>
              <Text>Phân loại</Text>
            </div>
            <div className={style.subTitle}>
              <Text>
                {record?.productPricingByProductPricing.product_type?.name ??
                  "-"}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "package",
      key: "package",
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        return (
          <div className={style.titleWrapper}>
            <div className={style.titleProduct}>
              <Text>Hình thức</Text>
            </div>
            <div className={style.subTitle}>
              <Text>
                {record?.productPricingByProductPricing?.package ?? "-"}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "unit",
      key: "unit",
      width: 200,
      ellipsis: true,
      render: (_, record) => {
        return (
          <div className={style.titleWrapper}>
            <div className={style.titleProduct}>
              <Text>Đơn vị</Text>
            </div>
            <div className={style.subTitle}>
              <Text>
                {record?.productPricingByProductPricing?.productByProduct
                  ?.unitByUnit?.name ?? "-"}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "time",
      key: "time",
      width: 250,
      ellipsis: true,
      render: (_, record) => {
        return (
          <div className={style.titleWrapper}>
            <div className={style.titleProduct}>
              <Text>Thời gian nhập</Text>
            </div>
            <div className={style.subTitle}>
              <Text>
                {moment(record?.booth_order_item?.created).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "stock",
      key: "stock",
      width: 250,
      ellipsis: true,
      render: (_, record) => {
        return (
          <div className={style.titleWrapper}>
            <div className={style.titleProduct}>
              <Text>Số lượng</Text>
            </div>
            <div className={style.subTitle}>
              <Text>{record?.stock ?? "-"}</Text>
            </div>
          </div>
        );
      },
    },
  ];

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    setRowSelection(selectedRowKeys);
    // setSelectedRows(selectedRows);
  };
  const [phone, setPhone] = useState({
    inputValue: "",
    //editInputIndex: -1,
    //editInputValue: '',
  });

  const [tagsPhone, setTagsPhone] = useState([]);

  const { data: booth, loading: loadingBooth, refetch } = useGetBooth({ id });

  const updateBooth = useUpdateBooth({ id });

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
    let addWard = _.cloneDeep(bothSupport);
    _.forEach(ward, (item) => {
      if (!_.some(temp, { ward: JSON.parse(item) })) {
        addWard.push({
          id: uuid(),
          province: parseProvince,
          ward: JSON.parse(item),
          district: parseDistrict,
        })
      }
    }

    );
    setBothSupport(addWard);
    // let differ = _.differenceBy(addWard, temp, 'ward');
    // if (_.size(differ) > 0) {

    // }

    // let filteredDataUnique = temp.reduce((unique, o) => {
    //   if (!unique.some((obj) => obj.ward.name === o.ward.name)) {
    //     unique.push(o);
    //   }
    //   return unique;
    // }, []);

    // setBothSupport(filteredDataUnique);
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

  const removeTagPhone = (e, item, index) => {
    e.preventDefault();
    const removedTagList = _.filter(tagsPhone, (element, key) => key !== index);
    setTagsPhone(removedTagList);
  };

  useEffect(() => {
    if (booth) {
      setInitialValues({
        name: _.get(booth, "name"),
      });
      //setName(_.get(booth, 'name'))
      setBothSupport(
        _.map(_.get(booth, "booth_incharges"), (item) => {
          return {
            id: uuid(),
            province: _.get(item, "province"),
            district: _.get(item, "district"),
            ward: _.get(item, "ward"),
          };
        })
      );
      setTagsPhone(
        _.map(_.get(booth, "booth_accounts"), (item) =>
          _.replace(item.account.phone, "+84", "0")
        )
      );
    }
  }, [booth]);

  const onFinish = (fieldsValue) => {
    let resultBothSupports = _.map(bothSupport, (item) => {
      return {
        province: _.get(item, "province.id"),
        district: _.get(item, "district.id"),
        ward: _.get(item, "ward.id"),
      };
    });

    if (_.isEmpty(ward) || ward === 0) {
      resultBothSupports.push(..._.map(wardList, item => {
        return {
          province: _.get(JSON.parse(province), 'id'),
          ward: _.get(item, "id"),
          district: _.get(JSON.parse(district), 'id'),
        }
      }))
    }

    let variables = {
      data: {
        id,
        name: fieldsValue.name,
        phone_numbers: _.map(tagsPhone),
        incharges: resultBothSupports,
        delete_product_pricings: rowSelection,
      },
    };
    setLoadingSubmit(true);

    updateBooth({
      variables,
    }).then(
      () => {
        setLoadingSubmit(false);
        setSuccessModal(true);
      },
      (error) => {
        setLoadingSubmit(false);
        notification["error"]({
          message: "Thất bại",
          description: _.get(
            error,
            "message",
            "Cập nhật kho hàng lưu động thất bại"
          ),
        });
      }
    );
  };

  const keyPress = (e) => {
    if (e.charCode === 32) {
      handleInputConfirm(e);
    }
  };

  const handleUploadFileComplete = (productList, otherProductList) => {
    setProductList(productList);
    setOtherProductList(otherProductList);
    setState(1);
  };

  const onFinishFailed = ({ values, errorFields, outOfDate }) => {
    console.log("Error form: ", values, errorFields, outOfDate);
  };
  if (loadingBooth || _.isEmpty(initialValues))
    return (
      <div className="wapperLoading">
        <Spin tip="Đang tải dữ liệu..." />
      </div>
    );

  return (
    <Fragment>
      {state == 0 && (
        <div className={clsx(style.customerPage)}>
          <UploadModal
            visible={isUpload}
            onBack={() => setIsUpload(false)}
            onComplete={(productList, otherProductList) =>
              handleUploadFileComplete(productList, otherProductList)
            }
          />
          <SuccessModal
            onSuccess={() => {
              setSuccessModal(false);
              history.push(slugs.booth);
            }}
            visible={successModal}
            title="Thành công"
            content="Chỉnh sửa kho hàng thành công"
          />
          <Row style={{ marginBottom: 24 }} justify="space-between">
            <div className={clsx(style.boxTitleCreate)}>
              <ArrowBack style={{ cursor: 'pointer', marginRight: 12 }} onClick={() => history.push('/booths')} /><Title level={3}>Thay đổi thông tin xe hàng lưu động</Title>
            </div>
            {/* <Button icon={<PlusOutlined />} onClick={() => { }} className={clsx(style.addBtn)}>Thêm sản phẩm</Button> */}
          </Row>
          <Form
            form={form}
            initialValues={initialValues}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
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
              <Row>
                <Col span={2} className={clsx(style.phoneTitle)}>
                  <Text className="input-label">
                    Số điện thoại <span style={{ color: "red" }}>*</span>
                  </Text>
                </Col>
                <Col span={22}>
                  <FormItem
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (tagsPhone.length === 0) {
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
                      <Row align="middle" style={{ width: "100%" }}>
                        <Col>
                          {_.map(tagsPhone, (item, index) => (
                            <Space size={2} key={index}>
                              <Tag
                                key={item}
                                closable
                                onClose={(e) => removeTagPhone(e, item, index)}
                                className={clsx(style.tagPhoneItem)}
                              >
                                {item}
                              </Tag>
                            </Space>
                          ))}
                        </Col>
                        <Col>
                          <Input
                            maxLength={12}
                            ref={saveInputRef}
                            placeholder="Nhập số điện thoại, phân cách bởi khoảng trắng"
                            value={phone.inputValue}
                            style={{
                              border: "none",
                              boxShadow: "none",
                              width: 400,
                            }}
                            type="text"
                            onBlur={handleInputConfirm}
                            onKeyPress={keyPress}
                            onPressEnter={handleInputConfirm}
                            onChange={handleInputChange}
                          />
                        </Col>
                      </Row>
                    </div>
                  </FormItem>
                </Col>
              </Row>
              <Row align="middle" style={{ marginBottom: 24, marginTop: 24 }}>
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
                              <Option
                                key={item.id}
                                value={JSON.stringify(item)}
                              >
                                {item.name}
                              </Option>
                            );
                          })}
                        </Select>
                      </FormItem>
                    </Col>
                    {/* <Col flex="60px">
                            <Button
                                onClick={addFieldSupport}
                                className={style.styleButtonAdd}
                                icon={<PlusOutlined />}
                            />
                        </Col> */}
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
                      <Row>
                        <Col flex="auto">{returnedTag(bothSupport)}</Col>
                      </Row>
                    )}
                  </div>
                </Col>
              </Row>
            </Wrapper>
            <div style={{ marginTop: "40px" }}>
              <div className="createFlash">
                <Row
                  justify="space-between"
                  className="headerWrapper"
                  style={{ borderBottom: "unset", paddingBottom: "5px" }}
                >
                  <Typography.Title level={4}>
                    Danh sách sản phẩm
                  </Typography.Title>
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => setIsUpload(true)}
                    className={clsx(style.addBtn)}
                  >
                    Thêm
                  </Button>
                </Row>

                <div className="contentWrapper">
                  {_.size(_.get(data, "booth_product")) === 0 ? (
                    <div className="imgWrapper">
                      <img src={Vector} width={100} height={200}></img>
                    </div>
                  ) : (
                    <Fragment>
                      <div style={{ position: "relative" }}>
                        <Table

                          rowSelection={{
                            selectedRowKeys: rowSelection,
                            onChange: onSelectChange,
                            preserveSelectedRowKeys: true,
                          }}
                          dataSource={data.booth_product}
                          scroll={{ x: 1200, y: 900 }}
                          rowKey={(record) =>
                            record.productPricingByProductPricing.id
                          }
                          columns={columns}
                          pagination={false}
                          loading={loading}
                        />
                        {/* <PaginationComponent
                                                total={_.size(data)}
                                                pageSize={pageSize}
                                                pageIndex={pageIndex}
                                                pageSizeOptions={[10, 20, 40, 80, 120]}
                                                setPageSize={setPageSize}
                                                setPageIndex={setPageIndex}
                                                pagename='PRODUCT'
                                            /> */}
                      </div>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
            <Row justify="end" style={{ marginTop: 24 }}>
              <Space>
                <Button
                  onClick={() => history.push(slugs.booth)}
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
          </Form>
        </div>
      )}
      {state === 1 && (
        <ProductCheckingComponent
          existedProducts={productList ?? []}
          otherProducts={otherProductList ?? []}
          onBack={() => {
            setState(0);
            setIsUpload(false);
          }}
          id={id}
        />
      )}
    </Fragment>
  );
};

export default BoothEdit;
