import { Fragment, useEffect, useState } from "react";
import { Button, Row, Typography, Table, Form, Input, DatePicker, Upload, message, Image, Space, Col, Divider, notification, Spin, Select } from "antd";
import Wrapper from "../../../../components/Wrapper/Wrapper"
import { PlusOutlined, LoadingOutlined, CloseCircleFilled } from '@ant-design/icons';
import Vector from "../../../../assets/icons/Vector.svg";
import slugs from "../../../../constant/slugs";
import { ReactComponent as UploadProduct } from "../../../../assets/icons/product/upload-product.svg"
import "./style.scss"
import ProductItemAdd from "../create/ProductItemAdd";
import axios from "axios";
import _, { concat } from "lodash";
import { useMutation, useQuery } from "@apollo/client";
import { EDIT_PROMOTION } from "../../../../graphql/schemas/promotion/mutation";
import { GET_PROMOTION, GET_PROMOTIONS_BY_TYPE_CODE } from "../../../../graphql/schemas/promotion/query";
import { useHistory, useParams } from "react-router";
import moment from "moment";
import { formatMoney } from "../../../../helpers/index";
import { FRUIT_EVENT } from "../../../../constant/info";
import { GET_LIST_BOOTHS_FILTER } from "../../../../graphql/schemas/booths/query";
const FruitEventDetail = () => {
    const { Title, Text } = Typography;
    const { id } = useParams();
    const [form] = Form.useForm();
    const { RangePicker } = DatePicker;
    const { TextArea } = Input;
    const [isList, setIsList] = useState(false);
    const [dataSelected, setDataSelected] = useState([]);
    const { Option } = Select;
    const [boothSelected, setBoothSelected] = useState([]);
    const [initValueForm, setInitValueForm] = useState({});
    const history = useHistory();
    const { data: booths } = useQuery(GET_LIST_BOOTHS_FILTER, {});

    const { loading: loadingPromotion, data } = useQuery(GET_PROMOTION, {
        variables: {
            id: id
        },
        fetchPolicy: 'network-only'
    })

    useEffect(() => {
        // let mounted = true;
        if (data) {
            let newData = _.map(data?.result?.promotion_product_pricings, item => ({
                id: item?.productPricingByProductPricing?.id,
                price: item?.productPricingByProductPricing?.price,
                product_type: {
                    name: item?.productPricingByProductPricing?.product_type.name
                },
                productByProduct: item?.productPricingByProductPricing?.productByProduct,
            }));
            let boothArr = _.map(data?.result?.promotion_booths ?? [], item => item?.boothByBooth?.id);
            let valueForm = {
                name: data?.result.name,
                time: [moment(data?.result?.start_time), moment(data?.result?.end_time)],
                description: data?.result.description,
                booth: boothArr,
            }
            setBoothSelected(boothArr);
            setInitValueForm(valueForm);
            setDataSelected(newData);
        }
        // return () => mounted = false;
    }, [data]);





    const filterDataUnits = (values) => {
        // if (_.get(values, 'category')) {
        //     const tmp = getUnitByCategory({ list: _.get(unitList, 'unit'), category: _.get(_.find(categories, ['id', _.get(values, 'category')]), 'code') });
        //     setExportDataUnits(tmp);
        // };
    }


    if (loadingPromotion || _.isEmpty(initValueForm)) return <div className="wapperLoading"><Spin tip="??ang t???i d??? li???u..." /></div>
    return <Fragment>
        <Form
            initialValues={initValueForm}
            layout="vertical"
            className="w-max" form={form}
        >
            <Typography.Title level={3} >Chi ti???t ch????ng tr??nh khuy???n m??i</Typography.Title>
            <Wrapper>

                <Form.Item rules={[{ required: true, message: 'T??n ch????ng tr??nh kh??ng ???????c ????? tr???ng' }]} name="name" label={<span style={{ color: '#748CAD' }}>T??n ch????ng tr??nh</span>}>
                    <Input disabled={true} />
                </Form.Item>
                <Form.Item rules={[{ required: true, message: 'Th???i gian kh??ng ???????c ????? tr???ng' }]} name="time" label={<span style={{ color: '#748CAD' }}>Th???i gian</span>}>
                    <RangePicker showTime placeholder={['Ng??y b???t ?????u', 'Ng??y k???t th??c']}
                        disabled={true}
                        showTime={{
                            hideDisabledOptions: true,
                            defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('11:59:59', 'HH:mm:ss')],
                        }}
                    />
                </Form.Item>
                <Form.Item rules={[{ required: true, message: 'Kho h??ng l??u ?????ng kh??ng ???????c ????? tr???ng' }]} name="booth" label={<span style={{ color: '#748CAD' }}>Kho h??ng l??u ?????ng</span>}>

                    <Select
                        disabled={true}
                        style={{ width: '410px' }}
                        showSearch
                        value={boothSelected}
                        mode="multiple"
                        placeholder=""
                        allowClear={true}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        <Option key="-7" value='CHECKALL'>Ch???n t???t c???</Option>
                        {_.map(booths?.results ?? [], (item, key) => {

                            return <Option key={key} value={item.id}>{item.code}</Option>
                        })}

                    </Select>
                </Form.Item>
                <Form.Item name="description" label={<span style={{ color: '#748CAD' }}>M?? t???</span>}>
                    <Input.TextArea rows={5} disabled={true} />
                </Form.Item>

            </Wrapper>
            <div style={{ marginTop: '40px' }}>
                <div className="createFlash">
                    <Row justify="space-between" className="headerWrapper">
                        <Typography.Title level={4}>Danh s??ch s???n ph???m</Typography.Title>
                    </Row>
                    <div className="contentWrapper">
                        {_.size(dataSelected) === 0 ? <div className="imgWrapper">
                            <img src={Vector} width={100} height={200}></img>
                        </div> :
                            <Fragment>
                                {_.map(dataSelected, (item, idx) => {
                                    return <Row key={idx}>

                                        <Col span={10}>
                                            <div className="flex align-center h-max">
                                                <Space size={12}>
                                                    <Image className="productImage" src={process.env.REACT_APP_S3_GATEWAY + _.get(item, 'productByProduct.photo.url')} alt="product_image" />
                                                    <div className="flex flex-column">
                                                        <Text style={{ fontSize: '20px' }}>{_.get(item, 'productByProduct.name')}</Text>
                                                        <Text>Gi??: <Text className="red">{formatMoney(_.get(item, 'price', ""))} ??</Text></Text>
                                                        <Text>M?? s???n ph???m: {_.get(item, 'productByProduct.code')}</Text>
                                                    </div>
                                                </Space>
                                            </div>
                                        </Col>
                                        <Col span={5} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                            <div className="align-center titleProduct">
                                                <Text>Tr???ng th??i s???n ph???m</Text>
                                            </div>
                                            <div className="subTitle align-center">
                                                <Text>{_.get(item, 'productByProduct.product_status.name')}</Text>
                                            </div>
                                        </Col>
                                        <Col span={5} className="titleWrapper" style={{ paddingTop: '30px' }}>
                                            <div className="align-center titleProduct">
                                                <Text>Ph??n lo???i</Text>

                                            </div>
                                            <div className="subTitle">
                                                <Text>{_.get(item, 'product_type.name')}</Text>
                                            </div>
                                        </Col>
                                        <Divider />
                                    </Row>
                                })}

                            </Fragment>
                        }
                    </div>
                </div>
            </div>
            <Row>
                <div className="w-max flex justify-end mt-3 custom-button">
                    <Space size={24}>
                        <Button htmlType="button" onClick={() => history.push(slugs.fruitEvent)} className="btn_reset__product_create">H???y</Button>
                    </Space>
                </div>
            </Row>
        </Form>

    </Fragment>

}

export default FruitEventDetail;