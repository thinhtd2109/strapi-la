import React, { Fragment, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Typography, Row, Col, Form, Input, Select, Upload, Button, Space, message, Image, InputNumber, notification, Checkbox } from 'antd';
import Wrapper from '../../../components/Wrapper/Wrapper';
import './style.scss';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { ReactComponent as UploadProduct } from '../../../assets/icons/product/upload-product.svg';
import SuccessModal from '../../../components/Modal/SuccessModal';
import FieldPrice from './FieldPrice';
import { useGetStatusProduct, useGetUnits, useCreateProduct } from '../hooks';
import axios from 'axios';
import DeleteModal from '../../../components/Modal/DeleteModal';
import { useGetCategories } from '../../../graphql/schemas/hook';
import _ from 'lodash';

import style from '../style.module.scss';

const { Text, Title } = Typography;

const { Option } = Select;

const ProductCreate = (props) => {
    const history = useHistory();

    const [form] = Form.useForm();

    const [successModal, setSuccessModal] = useState(false);
    const [cancelModal, setCancelModel] = useState(false);
    const [exportDataUnits, setExportDataUnits] = useState();

    const { data: unitList } = useGetUnits();
    const { data: statusList } = useGetStatusProduct();
    const { data: categories } = useGetCategories();

    const { handleCreateProduct } = useCreateProduct(history, setSuccessModal);
    const [image, setImage] = useState();
    const [loading, setLoading] = useState();

    const upload = async (file) => {

        const formData = new FormData();

        formData.append("file", file);

        formData.append('media_type_code', "PHOTO");

        setLoading(true)

        try {
            const config = {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
            const { data } = await axios.post(process.env.REACT_APP_BASEURL_UPLOAD, formData, config);
            setImage(data);
            setLoading(false)
        } catch (error) {
            console.log(error);
        }

    }

    function beforeUpload(file) {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg' || file.type === "image/svg+xml";
        setImage(null)
        if (isJpgOrPng === false) {
            message.error('Vui lòng chọn hình ảnh');
        }
        // const isLt2M = file.size / 1024 / 1024 < 2;
        // if (!isLt2M) {
        //   message.error('Image must smaller than 2MB!');
        // }
        return isJpgOrPng;
    }

    const onFinished = (values) => {
        setLoading(false);
        let productPriceList = [];
        let count = 0;
        for (let i = 0; i < values.product_pricings.length; i++) {
            for (let j = 0; j < values.product_pricings[i].type_price.length; j++) {
                productPriceList.push({
                    index: count++,
                    active: values.product_pricings[i].active === 'false' ? false : true,
                    package: values.product_pricings[i].type_price[j].package,
                    price: Number(values.product_pricings[i].type_price[j].price),
                    wholesale_price: Number(values.product_pricings[i].type_price[j].wholesale_price),
                    wholesale_quantity: Number(values.product_pricings[i].type_price[j].wholesale_quantity),
                    product_type: {
                        name: values.product_pricings[i].product_type
                    },
                    // product_sku: {
                    //     sku: values.product_pricings[i].product_sku || ""
                    // }
                })
            }
        };

        if (productPriceList.length > 0) {
            for (let i = 0; i < productPriceList.length; i++) {
                if (productPriceList[i].wholesale_price < 0) {
                    return notification['error']({
                        message: "Chỉnh sửa sản phẩm",
                        description: "Giá sỉ không được bé hơn 0"
                    })
                }
                if (productPriceList[i].price < 0) {
                    return notification['error']({
                        message: "Chỉnh sửa sản phẩm",
                        description: "Giá không được bé hơn 0"
                    })
                }
                if (productPriceList[i].wholesale_price > productPriceList[i].price) {
                    return notification['error']({
                        message: "Chỉnh sửa sản phẩm",
                        description: "Giá sỉ không được lớn hơn giá lẻ"
                    })
                }
                if (productPriceList[i].wholesale_price > productPriceList[i].price) {
                    return notification['error']({
                        message: "Tạo sản phẩm",
                        description: "Giá sỉ không được lớn hơn giá lẻ"
                    })
                }
            }

        }

        if (Number(values.wholesale_price) > Number(values.price)) {
            return notification['error']({
                message: "Tạo sản phẩm",
                description: "Giá sỉ không được lớn hơn giá lẻ"
            })
        }

        if (Number(values.price) < 0) {
            return notification['error']({
                message: "Chỉnh sửa sản phẩm",
                description: "Giá không được bé hơn 0"
            })
        }

        if (Number(values.wholesale_price) < 0) {
            return notification['error']({
                message: "Chỉnh sửa sản phẩm",
                description: "Giá sỉ không được bé hơn 0"
            })
        }

        if (Number(values.wholesale_quantity) < 0) {
            return notification['error']({
                message: "Chỉnh sửa sản phẩm",
                description: "Số lượng đạt sỉ không được bé hơn 0"
            })
        }

        let variables = {
            data: {
                category: values.category,
                name: values.name,
                wholesale_quantity: values.wholesale_quantity || 2,
                price: Number(values.price),
                wholesale_price: Number(values.wholesale_price),
                unit: values.unit,
                description: values.description,
                photo: image && image[0].id,
                status: values.status,
                product_pricings: productPriceList,
                only_booth: _.get(values, 'only_booth')
            }
        };

        handleCreateProduct({
            variables
        }).then(() => {
            setLoading(false);
            form.resetFields();
        }).catch((err) => {
            setLoading(false);
            notification['error']({
                message: "Tạo sản phẩm thất bại",
                description: err
            })
        })
    }

    useEffect(() => {
        if (unitList) {
            setExportDataUnits(_.get(unitList, 'unit'));
        }
    }, [unitList]);

    const filterDataUnits = (values) => {
        if (_.get(values, 'category')) {
            const unitByUnit = _.get(_.find(categories, ['id', _.get(values, 'category')]), 'category_units');
            const tmp = _.map(unitByUnit, item => ({ id: _.get(item, 'unitByUnit.id'), name: _.get(item, 'unitByUnit.name') }))
            setExportDataUnits(tmp);
        };
    }

    const onFinishFailed = (values) => { }

    return (
        <div className="wrapper-product-create">

            <SuccessModal onSuccess={() => history.push('/product')} visible={successModal} title="Thành công" content="Tạo sản phẩm thành công" />
            <DeleteModal onDelete={() => history.push('/product')} onCancel={() => setCancelModel(false)} visible={cancelModal} />
            <Form
                initialValues={{ product_pricings: [{ type_price: [''], type_product: '' }] }}
                onFinishFailed={(values) => onFinishFailed(values)}
                onFinish={onFinished}
                onValuesChange={filterDataUnits}
                layout="vertical"
                className="w-max" form={form}
            >
                <div className="w-max container">
                    <Row>
                        <Col span={12}>
                            <Title level={3}>Tạo sản phẩm</Title>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="only_booth" valuePropName="checked">
                                <Row justify='end'>
                                    <Checkbox style={{ marginRight: 6 }} />
                                    <Typography>Chỉ hiện ở <span style={{ fontWeight: 'bold' }}>kho hàng lưu động</span></Typography>
                                </Row>
                                
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
                <Wrapper>
                    <Row className="border-bottom">
                        <div className="w-max h-max flex flex-column container">
                            <Col span={24}>
                                <Text className="text__title" strong={true}>Thông tin chung</Text>
                            </Col>
                        </div>
                    </Row>
                    <Row>
                        <div className="w-max h-max flex flex-column container">
                            {/* <Form.Item label={<span style={{ color: '#748CAD' }}>Mã sản phẩm</span>}>
                                <Input />
                            </Form.Item> */}
                            <Form.Item rules={[{ required: true, message: 'Tên sản phẩm không được để trống' }]} name="name" label={<span style={{ color: '#748CAD' }}>Tên sản phẩm</span>}>
                                <Input />
                            </Form.Item>
                            <Row>
                                <Col span={18}>
                                    <Form.Item
                                        name="category"
                                        label={<span style={{ color: '#748CAD' }}>Loại sản phẩm</span>}
                                        rules={[{ required: true, message: 'Danh mục không được để trống' }]}
                                    >
                                        <Select style={{ width: '98%' }}>


                                            {_.map(categories, (category, key) => (
                                                <Option value={category.id} key={category.id}>{category.name}</Option>
                                            ))}

                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        name="unit"
                                        label={<span style={{ color: '#748CAD' }}>Đơn vị</span>}
                                        rules={[{ required: true, message: 'Đơn vị không được để trống' }]}
                                    >
                                        <Select>
                                            {exportDataUnits && exportDataUnits?.map((unit) => (
                                                <Option key={unit.id} value={unit.id}>{unit.name}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item
                                name="price"
                                label={<span style={{ color: '#748CAD' }}>Giá lẻ</span>}
                            >
                                <InputNumber addonAfter="đ" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} style={{ width: '100%' }} placeholder="Nhập thông tin" />
                            </Form.Item>
                            <Form.Item
                                name="wholesale_price"
                                label={<span style={{ color: '#748CAD' }}>Giá sỉ</span>}
                            >
                                <InputNumber addonAfter="đ" formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} style={{ width: '100%' }} placeholder="Nhập thông tin" />
                            </Form.Item>
                            <Form.Item
                                name="wholesale_quantity"
                                label={<span style={{ color: '#748CAD' }}>Số lượng đạt sỉ</span>}
                            >
                                <InputNumber defaultValue={2} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} style={{ width: '100%' }} placeholder="Nhập thông tin" />
                            </Form.Item>
                            <Form.Item
                                name="status"
                                label={<span style={{ color: '#748CAD' }}>Trạng thái sản phẩm</span>}
                            >
                                <Select>
                                    {statusList && statusList.product_status.map(status => (
                                        <Option key={status.id} value={status.id}>{status.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item label={<span style={{ color: '#748CAD' }}>Hình ảnh</span>}>
                                <Upload
                                    name="photo"
                                    listType={image ? undefined : "picture-card"}
                                    className="avatar-uploader"
                                    action={upload}

                                    beforeUpload={beforeUpload}
                                    showUploadList={false}
                                >
                                    <div>
                                        {image ? <Image
                                            style={{ width: '200px', cursor: 'pointer' }}
                                            src={`${process.env.REACT_APP_S3_GATEWAY}${image[0].url}`}
                                            alt="Image Product"
                                            preview={false} /> :
                                            loading ? <LoadingOutlined /> :
                                                <div className="flex flex-column"
                                                    style={{ colosr: '#FCB040' }}>
                                                    <UploadProduct
                                                        fill="#FCB040"
                                                        width="40px"
                                                        height="40px" />
                                                    Upload
                                                </div>
                                        }

                                    </div>
                                </Upload>
                            </Form.Item>
                            <Form.Item name="description" label={<span style={{ color: '#748CAD' }}>Mô tả</span>}>
                                <Input.TextArea rows={5} />
                            </Form.Item>

                        </div>

                    </Row>
                </Wrapper>
                <Wrapper>

                    <Form.List name="product_pricings">
                        {(fields, { add, remove }) => {
                            return (
                                <>
                                    <Row className="border-bottom">
                                        <div className="w-max h-max flex flex-column  container">
                                            <Row>
                                                <Col span={12}>
                                                    <Text className="text__title" strong={true}>Giá sản phẩm</Text>
                                                </Col>
                                                <Col span={12} className="flex justify-end align-center">
                                                    <Button
                                                        className={style.styleButtonPricingsAdd}
                                                        onClick={() => {
                                                            add({ type_price: [''] })
                                                        }}
                                                    ><PlusOutlined /> Thêm</Button>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Row>

                                    {fields.map(field => (
                                        <Fragment key={field.key}>
                                            <FieldPrice form={form} addField={add} remove={remove} field={field} fields={fields} />
                                        </Fragment>
                                    ))}

                                </>
                            )
                        }


                        }
                    </Form.List>
                </Wrapper>
                <Row>
                    <div className="w-max flex justify-end mt-3 custom-button">
                        <Space size={24}>
                            <Button htmlType="button" onClick={() => setCancelModel(true)} className="btn_reset__product_create">Hủy</Button>
                            <Button loading={loading} htmlType="submit" className="btn__btn-create__product">Xác nhận</Button>
                        </Space>
                    </div>
                </Row>

            </Form>
        </div>



    )
}

export default ProductCreate;
