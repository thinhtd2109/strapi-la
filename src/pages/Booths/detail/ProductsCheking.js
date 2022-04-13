import { Button, Col, Divider, Image, notification, Row, Space, Typography } from "antd"
import React, { Fragment, useState } from 'react';
import { LoadingOutlined, CloseCircleFilled } from '@ant-design/icons';
import { formatMoney } from "../../../helpers";
import _ from "lodash";
import Wrapper from "../../../components/Wrapper/Wrapper";
import moment from "moment";
import clsx from "clsx";
import style from '../style.module.scss';
import NoImage from './../../../assets/images/no-image.svg'
import { useMutation } from "@apollo/client";
import { IMPORT_BOOTH_PRODUCT } from "../../../graphql/schemas/booths/mutation";
import { GET_BOOTH_PRODUCT_LIST } from "../../../graphql/schemas/booths/query";
import PropTypes from 'prop-types';

const ProductCheckingComponent = ({ existedProducts, otherProducts, onBack, loadingSubmit, id }) => {
    const { Text, Title } = Typography;
    const [productList, setProductList] = useState(existedProducts ?? []);
    const [otherProductList, setOtherProductList] = useState(otherProducts ?? []);
    const [importBoothProduct, { loading, data }] = useMutation(IMPORT_BOOTH_PRODUCT, {
        refetchQueries: [
            {
                query: GET_BOOTH_PRODUCT_LIST,
                variables: {
                    boothId: id
                }
            }
        ]
    })
    const handleRemoveOtherItem = (sku) => {
        let newData = _.filter(otherProductList, item => item.sku_detail.sku !== sku);
        setOtherProductList(newData);
    }

    const handleRemoveExistedItem = (sku) => {
        let newData = _.filter(productList, item => item.sku_detail.sku !== sku);
        setProductList(newData);
    }

    const handleImportBoothProduct = () => {
        let product_pricings = _.map(productList, item => {
            return {
                product_pricing: item?.id,
                stock: item?.stock * 1
            }
        });

        //import booth product
        importBoothProduct({
            variables: {
                data: {
                    id: id,
                    product_pricings: product_pricings
                }
            }
        }).then(res => {
            notification['success']({
                message: 'Thành công',
                description: "Nhập danh sách sản phẩm thành công",
            });
            onBack();
        }).catch(err => {
            notification['error']({
                message: 'Thất bại',
                description: _.get(err, 'message', "Nhập danh sách sản phẩm thất bại"),
            });
        })
    }
    return <Fragment>
        <Title level={3}>Kiểm tra danh sách sản phẩm</Title>
        <Wrapper>
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
                                    <Text>Giá: <Text className="red">{formatMoney(_.get(item, 'price', "-"))} đ</Text></Text>
                                    <Text>Mã sản phẩm: {_.get(item, 'product_detail.code', '-')}</Text>
                                    <Text>Mã phân loại: {_.get(item, 'sku_detail.sku', '-')}</Text>

                                </div>
                            </Space>
                        </div>
                    </Col>
                    <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                        <div className="align-center titleProduct">
                            <Text>Phân loại</Text>
                        </div>
                        <div className="subTitle align-center">
                            <Text>{_.get(item, 'productByProduct.product_status.name', '-')}</Text>
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
                            <Text>{_.get(item, 'unit_detail.name', '-')}</Text>
                        </div>
                    </Col>
                    <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                        <div className="align-center titleProduct">
                            <Text>Phân loại</Text>

                        </div>
                        <div className="subTitle">
                            <Text>{_.get(item, 'type_detail.name', '-')}</Text>
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
                                <Image src={NoImage} />
                                <div className="flex flex-column">
                                    <Text style={{ fontSize: '20px' }}>{_.get(item, 'product_detail.name', '-')}</Text>
                                    <Text>Giá: <Text className="red">{formatMoney(_.get(item, 'price', "-"))}</Text></Text>
                                    <Text>Mã sản phẩm: {_.get(item, 'product_detail.code', '-')}</Text>
                                    <Text>Mã phân loại: {_.get(item, 'sku_detail.sku', '-')}</Text>

                                </div>
                            </Space>
                        </div>
                    </Col>
                    <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                        <div className="align-center titleProduct">
                            <Text>Phân loại</Text>
                        </div>
                        <div className="subTitle align-center">
                            <Text>{_.get(item, 'productByProduct.product_status.name', '-')}</Text>
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
                            <Text>{_.get(item, 'unit_detail.name', '-')}</Text>
                        </div>
                    </Col>
                    <Col span={2} className="titleWrapper" style={{ paddingTop: '30px' }}>
                        <div className="align-center titleProduct">
                            <Text>Phân loại</Text>

                        </div>
                        <div className="subTitle">
                            <Text>{_.get(item, 'type_detail.name', '-')}</Text>
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
                            <Text>{_.get(item, 'stock', '-')}</Text>
                        </div>
                    </Col>
                    <Col span={2} className="removeIcon" onClick={() => handleRemoveOtherItem(item.sku_detail?.sku)}>
                        <CloseCircleFilled />
                    </Col>
                    <Divider />
                </Row>
            })}
        </Wrapper>
        <Row justify="end" style={{ marginTop: 24 }}>
            <Space>
                <Button onClick={onBack} className={clsx(style.buttonCancel, style.button)}>Hủy</Button>
                <Button loading={loading} disabled={loading} onClick={handleImportBoothProduct} className={clsx(style.buttonConfirm, style.button)}>Xác nhận</Button>
            </Space>
        </Row>
    </Fragment>
}


export default ProductCheckingComponent;