import React from 'react'
import { Row, Col, Space, Typography, Image } from 'antd';
import * as _ from "lodash";
import './styles.scss';
import { formatMoney } from '../../../helpers';
const { Text } = Typography;

const OrderItems = ({ data }) => {
    if (!data) return null;

    return (
        <Row className="table-styling body-table">
            <Col span={9}>
                <div className="flex align-center h-max">
                    <Space size={12}>
                        <Image className="product_image" src={process.env.REACT_APP_S3_GATEWAY + _.get(data, 'productByProduct.photo.url')} alt="product_image" />
                        <div className="flex flex-column">
                            <Text strong={true}>{_.get(data, 'productByProduct.name')}</Text>
                            <Text>Cung cấp bởi <Text className="red">{_.get(data, 'productByProduct.vendorByVendor.name')}</Text></Text>
                            <Text>Mã sản phẩm: {_.get(data, 'productByProduct.code')}</Text>
                        </div>
                    </Space>
                </div>
            </Col>
            <Col span={3}>
                <div className="flex align-center h-max">
                    <Text>{formatMoney(_.get(data, 'price'))}<span className="underline">đ</span></Text>
                </div>
            </Col>
            <Col span={2}>
                <div className="flex align-center h-max" style={{ textAlign: 'center' }}>
                    <Text  >{_.get(data, 'quantity')}</Text>
                </div>
            </Col>
            <Col span={2}>
                <div className="flex align-center h-max">
                    <Text >{_.get(data, 'package')}</Text>
                </div>
            </Col>
            <Col span={2}>
                <div className="flex align-center h-max">
                    <Text>{(_.get(data, "price") > _.get(data, "sale_price")) ? `${_.floor((_.get(data, 'price') - _.get(data, 'sale_price')) * 100 / _.get(data, 'price')).toFixed(2)}%` : 0}</Text>
                </div>
            </Col>
            <Col span={3}>
                <div className="flex align-center h-max">
                    <Text>{(_.get(data, "price") > _.get(data, "sale_price")) ? formatMoney((_.subtract(_.get(data, 'price'), _.get(data, 'sale_price'))) * (_.get(data, "quantity"))) : 0}<span className="underline">đ</span></Text>
                </div>
            </Col>
            <Col span={3}>
                <div className="flex align-center justify-end w-max h-max">
                    <Text>{formatMoney(_.get(data, 'amount'))}<span className="underline">đ</span></Text>
                </div>
            </Col>
        </Row>
    )
}

export default OrderItems
