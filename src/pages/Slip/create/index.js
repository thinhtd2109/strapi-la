import React, { useState, useEffect, Fragment } from "react";
import { useHistory } from "react-router-dom";
import {
    Row,
    Col,
    Typography,
    Button,
    Form,
    Select,
    Space,
    Image,
    Divider,
    Input,
    notification,
} from "antd";
import { PlusOutlined, CloseCircleFilled } from "@ant-design/icons";
import Vector from "../../../assets/icons/Vector.svg";
import NoImage from "./../../../assets/images/no-image.svg";

import style from "./style.module.scss";
import clsx from "clsx";
import _ from "lodash";

import { ReactComponent as ArrowBack } from "../../../assets/icons/ArrowBack.svg";
import slugs from "../../../constant/slugs";
import { formatMoney } from "../../../helpers";
import moment from "moment";

import UploadModal from "../../../components/Modal/UploadModal";
import { useCreateBoothOrder, useGetAllBooth } from "../hooks";

const { useForm, Item: FormItem } = Form;

const { Text, Title } = Typography;
const { Option } = Select;

const CreateSlip = () => {
    const history = useHistory();
    const [form] = useForm();
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [isUpload, setIsUpload] = useState(false);
    /*
      0: Detail list
      1: Checking product list
      */
    const [productList, setProductList] = useState([]);
    const [totalProduct, setTotalProduct] = useState([]);

    const [otherProductList, setOtherProductList] = useState([]);

    const [productPricings, setProductPricings] = useState([]);
    const { data: booths, loading: loadingBooths } = useGetAllBooth();
    const { createBoothOrder } = useCreateBoothOrder();


    // Remove item
    const handleRemoveExistedItem = (sku) => {
        let newData = _.filter(productList, item => item.sku_detail.sku !== sku);
        setProductList(newData);
    }

    const handleRemoveOtherProductList = (idx) => {
        let newData = _.filter(otherProductList, (item, index) => index !== idx);
        setOtherProductList(newData);
    }


    const onFinish = (fieldsValue) => {
        let booths = [];
        if (_.size(productPricings) > 0) {
            _.forEach(fieldsValue?.booth, item => {
                booths.push(_.last(_.split(item, ' - ')).trim());
            })
            let variables = {
                data: {
                    boothids: booths,
                    // order_time: fieldsValue?.order_time,
                    type: "IN",
                    product_pricings: productPricings
                },
            };
            createBoothOrder({
                variables: variables
            })
        } else {
            notification['warning']({
                message: 'Th??ng b??o',
                description: 'Vui l??ng ch???n ??t nh???t m???t s???n ph???m',
            });
        }

    };

    //upload product by excel file
    const handleUploadFileComplete = (productList, otherProductList) => {
        setTotalProduct(_.concat(productList, otherProductList));
        setProductList(productList);
        setOtherProductList(otherProductList);
        setIsUpload(false);
    };

    const onFinishFailed = ({ values, errorFields, outOfDate }) => {
        console.log("Error form: ", values, errorFields, outOfDate);
    };

    useEffect(() => {
        let product_pricings = _.map(productList, item => {
            return {
                product_pricing: item?.id,
                stock: item?.stock * 1
            }
        });
        setProductPricings(product_pricings);
    }, [productList])

    return (
        <Fragment>
            <div className={clsx(style.createSlipPage)}>
                <UploadModal
                    visible={isUpload}
                    onBack={() => setIsUpload(false)}
                    onComplete={(productList, otherProductList) =>
                        handleUploadFileComplete(productList, otherProductList)
                    }
                />
                <Row style={{ marginBottom: 24 }} justify="space-between">
                    <div className={style.boxTitleCreate}>
                        <ArrowBack style={{ cursor: 'pointer', marginRight: 12 }} onClick={() => history.push('/slip')} /><Title level={3}>T???o phi???u nh???p</Title>
                    </div>
                </Row>
                <Form
                    form={form}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    {/* <Wrapper> */}
                    <div >
                        <div className="createFlash">
                            <Row
                                justify="space-between"
                                className="headerWrapper"
                                style={{ borderBottom: "unset", paddingBottom: "5px" }}
                            >
                                <Typography.Title level={4}>
                                    Th??ng tin nh???p
                                </Typography.Title>
                            </Row>
                            <Divider style={{ margin: "0 0 10px 0" }} />
                            <div className="contentWrapper">
                                <Row justify="start">
                                    <Col span={6}>
                                        <Form.Item
                                            name="status"
                                            label={<span style={{ color: '#748CAD' }}><span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>Tr???ng th??i</span>}

                                        >
                                            <Input disabled={true} placeholder="Y??u c???u" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={2}></Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="booth"
                                            label={<span style={{ color: '#748CAD' }}>M?? kho h??ng l??u ?????ng - Bi???n s???</span>}
                                            rules={[{ required: true, message: 'M?? kho h??ng l??u ?????ng - Bi???n s??? kh??ng ???????c ????? tr???ng' }]}
                                        >
                                            <Select placeholder="M?? kho h??ng l??u ?????ng - Bi???n s???" style={{ width: '98%' }} mode="multiple">
                                                {_.map(booths, (booth, key) => (
                                                    <Option value={`${booth.code} - ${booth.name} - ${booth.id}`} key={booth.id}>{booth.code} - {booth.name}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                {/* <Row justify="start">
                                    <Col span={6}>
                                        <Form.Item
                                            name="order_time"
                                            label={<span style={{ color: '#748CAD' }}>Th???i gian</span>}
                                            rules={[{ required: true, message: 'Th???i gian kh??ng ???????c ????? tr???ng' }]}
                                        >
                                            <DatePicker placeholder="Ch???n ng??y" showTime={{ format: 'HH:mm' }} style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                </Row> */}
                                <Row justify="start">
                                    <Col span={6}>
                                        <Form.Item
                                            name="type"
                                            label={<span style={{ color: '#748CAD' }}><span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>Lo???i</span>}
                                        >
                                            <Input disabled={true} placeholder="Nh???p" style={{ width: "90%", marginLeft: "37px" }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row justify="start">
                                    <Col span={6}>
                                        <Form.Item
                                            name="type"
                                            label={<span style={{ color: '#748CAD' }}><span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>M?? phi???u</span>}
                                        >
                                            <Input disabled={true} placeholder="B0XXXXX" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>


                    {/* </Wrapper> */}
                    <div style={{ marginTop: "40px" }}>
                        <div className="createFlash">
                            <Row
                                justify="space-between"
                                className="headerWrapper"
                                style={{ borderBottom: "unset", paddingBottom: "5px" }}
                            >
                                <Typography.Title level={4}>
                                    Danh s??ch s???n ph???m
                                </Typography.Title>
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={() => setIsUpload(true)}
                                    className={clsx(style.addBtn)}
                                >
                                    Th??m
                                </Button>
                            </Row>
                            <Divider />
                            <div className="contentWrapper">
                                {(_.size(productList) + _.size(otherProductList)) === 0 ? (
                                    <div className="imgWrapper">
                                        <img src={Vector} width={100} height={200}></img>
                                    </div>
                                ) : (
                                    <Fragment>
                                        {_.map(productList ?? [], (item, idx) => {
                                            return <Row key={idx}>

                                                <Col span={8}>
                                                    <div className="flex align-center h-max">
                                                        <Space size={12}>
                                                            {
                                                                _.get(item, 'product_detail.photo.url') !== undefined ? <Image className="productImage" src={process.env.REACT_APP_S3_GATEWAY + _.get(item, 'product_detail.photo.url')} alt="product_image" /> : <Image src={NoImage} />
                                                            }

                                                            <div className="flex flex-column">
                                                                <Text style={{ fontSize: '20px' }}>{_.get(item, 'product_detail.name', '-')}</Text>
                                                                <Text>Gi??: <Text className="red">{formatMoney(_.get(item, 'price', "-"))} ??</Text></Text>
                                                                <Text>M?? s???n ph???m: {_.get(item, 'product_detail.code', '-')}</Text>
                                                                <Text>M?? ph??n lo???i: {_.get(item, 'sku_detail.sku', '-')}</Text>

                                                            </div>
                                                        </Space>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>Ph??n lo???i</Text>
                                                    </div>
                                                    <div className="subTitle align-center">
                                                        <Text>{_.get(item, 'productByProduct.product_status.name', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>H??nh th???c</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{_.get(item, 'package', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>????n v???</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{_.get(item, 'unit_detail.name', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>Ph??n lo???i</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{_.get(item, 'type_detail.name', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={4} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>Th???i gian nh???p</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{moment(new Date()).format("DD/MM/YYYY HH:mm")}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>S??? l?????ng</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{_.get(item, 'stock', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="removeIcon" onClick={() => handleRemoveExistedItem(item.sku_detail?.sku)}>
                                                    <CloseCircleFilled />
                                                </Col>
                                                <Divider />
                                            </Row>
                                        })}
                                        {_.map(otherProductList ?? [], (item, idx) => {
                                            return <Row key={idx}>
                                                <Col span={8}>
                                                    <div className="flex align-center h-max">
                                                        <Space size={12}>
                                                            {
                                                                _.get(item, 'product_detail.photo.url') !== undefined ? <Image className="productImage" src={process.env.REACT_APP_S3_GATEWAY + _.get(item, 'product_detail.photo.url')} alt="product_image" /> : <Image src={NoImage} />
                                                            }

                                                            <div className="flex flex-column">
                                                                <Text style={{ fontSize: '20px' }}>{_.get(item, 'product_detail.name', '-')}</Text>
                                                                <Text>Gi??: <Text className="red">{formatMoney(_.get(item, 'price', "-"))} ??</Text></Text>
                                                                <Text>M?? s???n ph???m: {_.get(item, 'product_detail.code', '-')}</Text>
                                                                <Text>M?? ph??n lo???i: {_.get(item, 'sku_detail.sku', '-')}</Text>

                                                            </div>
                                                        </Space>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>Ph??n lo???i</Text>
                                                    </div>
                                                    <div className="subTitle align-center">
                                                        <Text>{_.get(item, 'productByProduct.product_status.name', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>H??nh th???c</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{_.get(item, 'package', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>????n v???</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{_.get(item, 'unit_detail.name', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>Ph??n lo???i</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{_.get(item, 'type_detail.name', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={4} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>Th???i gian nh???p</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{moment(new Date()).format("DD/MM/YYYY HH:mm")}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>S??? l?????ng</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{_.get(item, 'stock', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="removeIcon" onClick={() => handleRemoveOtherProductList(idx)}>
                                                    <CloseCircleFilled />
                                                </Col>
                                                <Divider />
                                            </Row>
                                        })}
                                    </Fragment>
                                )}
                            </div>
                        </div>
                    </div>
                    <Row justify="end" style={{ marginTop: 24 }}>
                        <Space>
                            <Button
                                onClick={() => history.push(slugs.slip)}
                                className={clsx(style.buttonCancel, style.button)}
                            >
                                H???y
                            </Button>
                            <Button
                                loading={loadingSubmit}
                                disabled={loadingSubmit}
                                htmlType="submit"
                                className={clsx(style.buttonConfirm, style.button)}
                            >
                                X??c nh???n
                            </Button>
                        </Space>
                    </Row>
                </Form>
            </div>
        </Fragment>
    );
};

export default CreateSlip;
