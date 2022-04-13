import { Form, Row, Typography, Col, Space, Input, Button, notification, Spin } from 'antd';
import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Wrapper from '../../../../components/Wrapper/Wrapper';
import styles from "../create/styles.module.scss"

import clsx from 'clsx';
import slugs from '../../../../constant/slugs';
import SuccessModal from '../../../../components/Modal/SuccessModal';
import { useCreateCategory, useGetCategories } from '../hooks';

import _ from 'lodash'

const { useForm, Item: FormItem } = Form;
const { Title, Text } = Typography;

const ArticlesCategoryEdit = () => {
    const { id } = useParams();
    const { data, loading: loadingDetail } = useGetCategories({ filter: { id: { eq: id } } });
    const [form] = useForm();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState();
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const onFinish = (values) => {
        setLoading(true)
    }

    useEffect(() => {
        setInitialValues({
            code: _.get(data, 'data[0].attributes.code'),
            name: _.get(data, 'data[0].attributes.name')
        })
    }, [data])

    if (loadingDetail || _.isEmpty(_.get(data, 'data[0]')))
        return (
            <div className="wapperLoading">
                <Spin tip="Đang tải dữ liệu..." />
            </div>
        );

    return (
        <>
            <Form form={form} initialValues={initialValues} onFinish={onFinish}>
                <SuccessModal
                    title="Thành công"
                    content="Chỉnh sửa danh mục thành công"

                    onSuccess={() => history.push({ pathname: slugs.articles, state: { tabActive: '1' } })}
                    visible={openSuccessModal}
                />
                <div>
                    <Row justify="space-between" style={{ marginBottom: 24 }}>
                        <Title level={3}>Chỉnh sửa danh mục</Title>
                    </Row>
                    <Wrapper>
                        <Row>
                            <Col xs={10}>
                                <Space direction="vertical" size={54} style={{ width: "100%" }}>
                                    <Space
                                        direction="vertical"
                                        size={34}
                                        style={{ width: "100%" }}
                                    >
                                        <Row align="middle">
                                            <Col xs={8}>
                                                <Text className="input-label">
                                                    Mã danh mục <span style={{ color: "red" }}>*</span>
                                                </Text>
                                            </Col>
                                            <Col xs={16}>
                                                <FormItem
                                                    rules={[({ getFieldValue }) => ({
                                                        validator(_, value) {
                                                            if (!value || value.trim() === "") {
                                                                return Promise.reject(
                                                                    new Error("Mã danh mục không được để trống")
                                                                );
                                                            } else {
                                                                return Promise.resolve();
                                                            }
                                                        },
                                                    })]}
                                                    name="code"
                                                    className={styles.formItem}
                                                >
                                                    <Input
                                                        allowClear
                                                        placeholder="Mã danh mục"
                                                        className={clsx(styles.input)}
                                                    />
                                                </FormItem>
                                            </Col>
                                        </Row>
                                        <Row align="middle">
                                            <Col xs={8}>
                                                <Text className="input-label">
                                                    Tên danh mục <span style={{ color: "red" }}>*</span>
                                                </Text>
                                            </Col>
                                            <Col xs={16}>
                                                <FormItem
                                                    rules={[
                                                        ({ getFieldValue }) => ({
                                                            validator(_, value) {
                                                                if (!value || value.trim() === "") {
                                                                    return Promise.reject(
                                                                        new Error("Tên danh mục không được để trống")
                                                                    );
                                                                } else {
                                                                    return Promise.resolve();
                                                                }
                                                            },
                                                        }),
                                                    ]}
                                                    name="name"
                                                    className={styles.formItem}
                                                >
                                                    <Input
                                                        allowClear
                                                        placeholder="Tên danh mục"
                                                        className={clsx(styles.input)}

                                                    />
                                                </FormItem>
                                            </Col>
                                        </Row>
                                    </Space>
                                </Space>
                            </Col>
                        </Row>
                    </Wrapper>
                    <Row justify="end" style={{ marginTop: 24 }}>
                        <Space>
                            <Button
                                onClick={() => history.push(slugs.articles)}
                                className={clsx(styles.buttonCancel, styles.button)}
                            >
                                Hủy
                            </Button>
                            <Button
                                loading={loading}
                                disabled={loading}
                                htmlType="submit"
                                className={clsx(styles.buttonConfirm, styles.button)}
                            >
                                Xác nhận
                            </Button>
                        </Space>
                    </Row>
                </div>
            </Form>
        </>
    )
}

export default ArticlesCategoryEdit