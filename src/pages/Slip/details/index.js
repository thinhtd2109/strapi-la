import React, { useState, Fragment } from "react";
import { useParams, useLocation, useHistory } from 'react-router-dom';
import {
    Row,
    Col,
    Typography,
    Button,
    Form,
    Space,
    Image,
    Divider,
    Spin,
    notification
} from "antd";
import { PlusOutlined, CloseCircleFilled } from "@ant-design/icons";
import Vector from "../../../assets/icons/Vector.svg";
import NoImage from "./../../../assets/images/no-image.svg";

import style from "./styles.module.scss";
import clsx from "clsx";
import _ from "lodash";
import Wrapper from "../../../components/Wrapper/Wrapper";

import { ReactComponent as ArrowBack } from "../../../assets/icons/ArrowBack.svg";
import uuid from "react-uuid";
import slugs from "../../../constant/slugs";
import { formatMoney } from "../../../helpers";
import moment from "moment";

import UploadModal from "../../../components/Modal/UploadModal";
import { useGetOrderBooth, useUpdateOrderBoothStatus } from "../hooks";
import { GET_BOOTH_PRODUCT_LIST } from '../../../graphql/schemas/booths/query';
import { useQuery } from '@apollo/client';
import WarningModal from '../../../components/Modal/WarningModal';
import { GET_ALL_BOOTH_ORDERS } from "../../../graphql/schemas/slip/query";

const { useForm, Item: FormItem } = Form;

const { Text, Title } = Typography;


const SlipDetail = () => {
    const { id } = useParams();
    const history = useHistory();
    // const [otherProductList, setOtherProductList] = useState([]);

    const [confirmAction, setConfirmAction] = useState(false);
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    const { data, loading: loadingData, refetch } = useGetOrderBooth({ code: id, id: location.state.boothId });
    const update = useUpdateOrderBoothStatus();

    const cancelOrderBooth = () => {
        setLoading(true)
        update({
            variables: {
                data: {
                    code: id,
                    status_code: "CANCEL"
                }
            }
        }).then(() => {
            refetch();
            history.push(slugs.slip);
            notification["success"]({
                description:
                    'Huỷ thành công.',
            });
            setLoading(false);
            setConfirmAction(false);
        })
    }

    if (loadingData) {
        return <div className="wapperLoading"><Spin tip="Đang tải dữ liệu..." /></div>
    }

    return (
        <Fragment>
            <WarningModal
                width={420}
                onBack={() => setConfirmAction(false)}
                visible={confirmAction}
                title="Thông báo"
                content={`Bạn có muốn hủy phiếu nhập`}
                onSubmit={cancelOrderBooth}
                loading={loading}
            />
            <div className={clsx(style.createSlipPage)}>
                <Row style={{ marginBottom: 24 }} justify="space-between">
                    <div className={style.boxTitleCreate}>
                        <ArrowBack style={{ cursor: 'pointer', marginRight: 14 }} onClick={() => history.push('/slip')} /><Title level={3}>Chi tiết phiếu nhập</Title>
                    </div>
                </Row>
                <div >
                    <div className="createFlash">
                        <Row
                            justify="space-between"
                            className="headerWrapper"
                            style={{ borderBottom: "unset", paddingBottom: "5px" }}
                        >
                            <Typography.Title level={4}>
                                Thông tin nhập
                            </Typography.Title>
                        </Row>
                        <Divider style={{ margin: "0 0 10px 0" }} />
                        <div className="contentWrapper">
                            <Row justify="start">
                                <Col span={6}>
                                    <Form.Item
                                        name="status"
                                        label={<span style={{ color: '#748CAD' }}><span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>Trạng thái</span>}

                                    >
                                        {_.get(data, 'booth_order_status.name', '-')}
                                    </Form.Item>
                                </Col>
                                <Col span={2}></Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="booth"
                                        label={<span style={{ color: '#748CAD' }}>Mã kho hàng lưu động - Biển số</span>}
                                        rules={[{ required: true, message: 'Mã kho hàng lưu động - Biển số không được để trống' }]}
                                    >
                                        {_.get(data, "boothByBooth.code") + " - " + _.get(data, "boothByBooth.name")}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify="start">
                                <Col span={6}>
                                    <Form.Item
                                        name="order_time"
                                        label={<span style={{ color: '#748CAD' }}>Ngày tạo phiếu</span>}
                                        rules={[{ required: true, message: 'Thời gian không được để trống' }]}
                                    >

                                        {_.get(data, 'order_time') ? moment(_.get(data, "order_time")).format('DD/MM/YYYY') : "-"}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify="start">
                                <Col span={6}>
                                    <Form.Item
                                        name="order_time"
                                        label={<span style={{ color: '#748CAD' }}>Ngày nhập hàng</span>}
                                        rules={[{ required: true, message: 'Thời gian không được để trống' }]}
                                    >

                                        {_.get(data, 'received_time') ? moment(_.get(data, "received_time")).format('DD/MM/YYYY') : '-'}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify="start">
                                <Col span={6}>
                                    <Form.Item
                                        name="type"
                                        label={<span style={{ color: '#748CAD' }}><span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>Loại</span>}
                                    >
                                        {data?.type === "IN" ? "Nhập" : "Xuất"}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row justify="start">
                                <Col span={6}>
                                    <Form.Item
                                        name="type"
                                        label={<span style={{ color: '#748CAD' }}><span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>Mã phiếu</span>}
                                    >
                                        {_.get(data, "code", '-')}
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
                                Danh sách sản phẩm
                            </Typography.Title>

                        </Row>
                        <Divider />
                        <div className="contentWrapper">
                            {_.isEmpty(_.get(data, 'booth_order_items')) ? (
                                <div className="imgWrapper">
                                    <img src={Vector} width={100} height={200}></img>
                                </div>
                            ) : (
                                <Fragment>
                                    {_.map(_.get(data, 'booth_order_items') ?? [], (item, idx) => {
                                        return (
                                            <Row key={idx}>
                                                <Col span={8}>
                                                    <div className="flex align-center h-max">
                                                        <Space size={12}>
                                                            {
                                                                _.get(item, 'product.photo.url') !== undefined ? <Image className="productImage" src={process.env.REACT_APP_S3_GATEWAY + _.get(item, 'product.photo.url')} alt="product_image" /> : <Image src={NoImage} />
                                                            }

                                                            <div className="flex flex-column">
                                                                <Text style={{ fontSize: '20px' }}>{_.get(item, 'product.name', '-')}</Text>
                                                                <Text>Giá: <Text className="red">{formatMoney(_.get(item, 'price'))} đ</Text></Text>
                                                                <Text>Mã sản phẩm: {_.get(item, 'product.code', '-')}</Text>
                                                                <Text>Mã phân loại: {_.get(item, 'product_sku.sku', '-') || "-"}</Text>

                                                            </div>
                                                        </Space>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>Phân loại</Text>
                                                    </div>
                                                    <div className="subTitle align-center">
                                                        <Text>{_.get(item, 'product.product_status.name', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>Hình thức</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{_.get(item, 'package', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>Đơn vị</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{_.get(item, 'product.unitByUnit.name', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>Phân loại</Text>
                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{_.get(item, 'product_type.name', '-')}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={4} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>Thời gian nhập</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{moment(new Date()).format("DD/MM/YYYY HH:mm")}</Text>
                                                    </div>
                                                </Col>
                                                <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                                    <div className="align-center titleProduct">
                                                        <Text>Số lượng</Text>

                                                    </div>
                                                    <div className="subTitle">
                                                        <Text>{_.get(item, 'quantity', '-')}</Text>
                                                    </div>
                                                </Col>

                                                <Divider />
                                            </Row>
                                        )
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
                            Quay lại
                        </Button>
                        <Button
                            onClick={() => setConfirmAction(true)}

                            htmlType="submit"
                            disabled={_.get(data, 'booth_order_status.code') !== "INITIAL"}
                            className={clsx(style.buttonConfirm, style.button)}
                        >
                            Hủy
                        </Button>
                    </Space>
                </Row>
            </div>

        </Fragment>

    )
}

export default SlipDetail