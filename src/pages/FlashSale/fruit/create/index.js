import { Fragment, useState } from "react";
import {
  Button,
  Row,
  Typography,
  Form,
  Input,
  DatePicker,
  Image,
  Space,
  Col,
  Divider,
  notification,
  Select,
} from "antd";
import Wrapper from "../../../../components/Wrapper/Wrapper";
import {
  PlusOutlined,
  LoadingOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import Vector from "../../../../assets/icons/Vector.svg";
import slugs from "../../../../constant/slugs";
import "./style.scss";
import ProductItemAdd from "./ProductItemAdd";
import _, { concat } from "lodash";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_PROMOTION } from "../../../../graphql/schemas/promotion/mutation";
import { GET_PROMOTIONS_BY_TYPE_CODE } from "../../../../graphql/schemas/promotion/query";
import { useHistory } from "react-router";
import moment from "moment";
import { formatMoney } from "../../../../helpers";
import { GET_LIST_BOOTHS_FILTER } from "../../../../graphql/schemas/booths/query";
import WarningModal from "../../../../components/Modal/WarningModal";
import { FRUIT_EVENT } from "../../../../constant/info";

const FruitEventCreate = () => {
  const { Title, Text } = Typography;
  const [form] = Form.useForm();
  const { RangePicker } = DatePicker;
  const { TextArea } = Input;
  const { Option } = Select;
  const [isList, setIsList] = useState(false);
  const [isCancel, setIsCancel] = useState(false);
  const [dataSelected, setDataSelected] = useState([]);
  const [boothSelected, setBoothSelected] = useState([]);
  const history = useHistory();
  const [createPromotion, { data: dataPromotion }] = useMutation(
    CREATE_PROMOTION,
    {
      refetchQueries: [
        {
          query: GET_PROMOTIONS_BY_TYPE_CODE,
          variables: {
            code: FRUIT_EVENT,
          },
        },
      ],
    }
  );

  const { data: booths } = useQuery(GET_LIST_BOOTHS_FILTER, {});

  const onComplete = (data) => {
    let newData = _.unionBy(dataSelected, data, "id");
    setDataSelected(newData);
    setIsList(false);
  };

  const handleRemoveItem = (id) => {
    let newData = _.filter(dataSelected, (item) => item.id !== id);
    setDataSelected(newData);
  };

  const onBoothSelected = (booth) => {
    if (_.includes(booth, "CHECKALL")) {
      let allItems = _.map(_.get(booths, "results", []), (item) => item.id);
      form.setFieldsValue({
        booth: allItems,
      });
      setBoothSelected(allItems);
    } else {
      setBoothSelected(booth);
    }
    //onBoothChange(booth);
  };

  const onFinished = (values) => {
    if (_.size(dataSelected) > 0) {
      //Handle create flash sale
      let pricings = _.map(dataSelected, (item) => ({
        product_pricing: item.id,
        percent: item.percent,
      }));
      let promotion_booths = _.map(boothSelected, (item) => {
        return {
          booth: item,
        };
      });
      createPromotion({
        variables: {
          arg: {
            code: null,
            name: values.name,
            promotion_type_code: FRUIT_EVENT,
            description: values.description,
            banner: null,
            start_time: values.time[0],
            end_time: values.time[1],
            promotion_product_pricings: pricings,
            promotion_booths: promotion_booths,
          },
        },
      })
        .then(() => {
          notification["success"]({
            message: "Th??nh c??ng",
            description: "Th??m ch????ng tr??nh khuy???n m??i th??nh c??ng",
          });
          form.resetFields();
          setDataSelected([]);
          history.push(slugs.fruitEvent);
        })
        .catch((err) => {
          notification["error"]({
            message: "Th???t b???i",
            description: _.get(
              err,
              "message",
              "Th??m ch????ng tr??nh khuy???n m??i th???t b???i"
            ),
          });
        });
    } else {
      notification["warning"]({
        message: "Th??ng b??o",
        description: "Vui l??ng ch???n ??t nh???t m???t s???n ph???m",
      });
    }
  };
  const filterDataUnits = (values) => {
    // if (_.get(values, 'category')) {
    //     const tmp = getUnitByCategory({ list: _.get(unitList, 'unit'), category: _.get(_.find(categories, ['id', _.get(values, 'category')]), 'code') });
    //     setExportDataUnits(tmp);
    // };
  };

  const onFinishFailed = (values) => {};

  //Set disabled range time
  function range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }
  function disabledDate(current) {
    // Can not select days before today
    return current && current < moment().startOf("day");
  }

  const handleOnCancel = () => {
    notification["success"]({
      message: "Th??nh c??ng",
      description: "H???y t???o ch????ng tr??nh khuy???n m??i th??nh c??ng",
    });
    setIsCancel(true);
    history.push(slugs.fruitEvent);
  };
  return (
    <Fragment>
      <WarningModal
        title="Th??ng b??o"
        content="B???n mu???n h???y t???o ch????ng tr??nh khuy???n m??i"
        onBack={() => setIsCancel(false)}
        visible={isCancel}
        onSubmit={handleOnCancel}
      />
      {!isList ? (
        <Form
          initialValues={{
            product_pricings: [{ type_price: [""], type_product: "" }],
          }}
          onFinishFailed={(values) => onFinishFailed(values)}
          onFinish={onFinished}
          onValuesChange={filterDataUnits}
          layout="vertical"
          className="w-max"
          form={form}
        >
          <Typography.Title level={3}>
            T???o ch????ng tr??nh khuy???n m??i
          </Typography.Title>
          <Wrapper>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "T??n ch????ng tr??nh kh??ng ???????c ????? tr???ng",
                },
              ]}
              name="name"
              label={<span style={{ color: "#748CAD" }}>T??n ch????ng tr??nh</span>}
            >
              <Input />
            </Form.Item>
            <Form.Item
              rules={[
                { required: true, message: "Th???i gian kh??ng ???????c ????? tr???ng" },
              ]}
              name="time"
              label={<span style={{ color: "#748CAD" }}>Th???i gian</span>}
            >
              <RangePicker
                showTime
                placeholder={["Ng??y b???t ?????u", "Ng??y k???t th??c"]}
                disabledDate={disabledDate}
                showTime={{
                  hideDisabledOptions: true,
                  defaultValue: [
                    moment("00:00:00", "HH:mm:ss"),
                    moment("11:59:59", "HH:mm:ss"),
                  ],
                }}
              />
            </Form.Item>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Kho h??ng l??u ?????ng kh??ng ???????c ????? tr???ng",
                },
              ]}
              name="booth"
              label={
                <span style={{ color: "#748CAD" }}>Kho h??ng l??u ?????ng</span>
              }
            >
              <Select
                style={{ width: "410px" }}
                showSearch
                value={boothSelected}
                mode="multiple"
                placeholder=""
                allowClear={true}
                optionFilterProp="children"
                onChange={onBoothSelected}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                <Option key="-7" value="CHECKALL">
                  Ch???n t???t c???
                </Option>
                {_.map(booths?.results ?? [], (item, key) => {
                  return (
                    <Option key={key} value={item.id}>
                      {item.code}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item
              name="description"
              label={<span style={{ color: "#748CAD" }}>M?? t???</span>}
            >
              <Input.TextArea rows={5} />
            </Form.Item>
          </Wrapper>
          <div style={{ marginTop: "40px" }}>
            <div className="createFlash">
              <Row justify="space-between" className="headerWrapper">
                <Typography.Title level={4}>
                  Danh s??ch s???n ph???m
                </Typography.Title>
                <Button
                  className="addBtn"
                  icon={<PlusOutlined />}
                  onClick={() => setIsList(true)}
                >
                  Th??m
                </Button>
              </Row>
              <div className="contentWrapper">
                {_.size(dataSelected) === 0 ? (
                  <div className="imgWrapper">
                    <img src={Vector} width={100} height={200}></img>
                  </div>
                ) : (
                  <Fragment>
                    {_.map(dataSelected, (item, idx) => {
                      return (
                        <Row key={idx}>
                          <Col span={10}>
                            <div className="flex align-center h-max">
                              <Space size={12}>
                                <Image
                                  className="productImage"
                                  src={
                                    process.env.REACT_APP_S3_GATEWAY +
                                    _.get(item, "productByProduct.photo.url")
                                  }
                                  alt="product_image"
                                />
                                <div className="flex flex-column">
                                  <Text style={{ fontSize: "20px" }}>
                                    {_.get(item, "productByProduct.name")}
                                  </Text>
                                  <Text>
                                    Gi??:{" "}
                                    <Text className="red">
                                      {formatMoney(_.get(item, "price", ""))} ??
                                    </Text>
                                  </Text>
                                  <Text>
                                    M?? s???n ph???m:{" "}
                                    {_.get(item, "productByProduct.code")}
                                  </Text>
                                </div>
                              </Space>
                            </div>
                          </Col>
                          <Col
                            span={5}
                            className="titleWrapper"
                            style={{ paddingTop: "30px" }}
                          >
                            <div className="align-center titleProduct">
                              <Text>Tr???ng th??i s???n ph???m</Text>
                            </div>
                            <div className="subTitle align-center">
                              <Text>
                                {_.get(
                                  item,
                                  "productByProduct.product_status.name"
                                )}
                              </Text>
                            </div>
                          </Col>
                          <Col
                            span={5}
                            className="titleWrapper"
                            style={{ paddingTop: "30px" }}
                          >
                            <div className="align-center titleProduct">
                              <Text>Ph??n lo???i</Text>
                            </div>
                            <div className="subTitle">
                              <Text>{_.get(item, "product_type.name")}</Text>
                            </div>
                          </Col>
                          <Col
                            span={4}
                            className="removeIcon"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <CloseCircleFilled />
                          </Col>
                          <Divider />
                        </Row>
                      );
                    })}
                  </Fragment>
                )}
              </div>
            </div>
          </div>
          <Row>
            <div className="w-max flex justify-end mt-3 custom-button">
              <Space size={24}>
                <Button
                  htmlType="button"
                  onClick={() => setIsCancel(true)}
                  className="btn_reset__product_create"
                >
                  H???y
                </Button>
                <Button htmlType="submit" className="btn__btn-create__product">
                  X??c nh???n
                </Button>
              </Space>
            </div>
          </Row>
        </Form>
      ) : (
        <ProductItemAdd
          onCancel={() => setIsList(false)}
          onComplete={onComplete}
        />
      )}
    </Fragment>
  );
};

export default FruitEventCreate;
