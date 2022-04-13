import { Form, Row, Typography, Col, Space, Input, Button, notification } from 'antd';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Wrapper from '../../../../components/Wrapper/Wrapper';
import styles from "./styles.module.scss"

import clsx from 'clsx';
import slugs from '../../../../constant/slugs';
import SuccessModal from '../../../../components/Modal/SuccessModal';
import { useCreateCategory } from '../hooks';

import _ from 'lodash'

const { useForm, Item: FormItem } = Form;
const { Title, Text } = Typography;

const ArticlesCreate = () => {

    const [form] = useForm();
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const createCategory = useCreateCategory();
    const onFinish = (values) => {
        setLoading(true)
        createCategory({
            variables: {
                data: {
                    code: values.code,
                    name: values.name
                }
            }
        }).then(() => {
            setOpenSuccessModal(true);
            setLoading(false)
        }, (error) => {
            setLoading(false);
            notification["error"]({
                message: "Thất bại",
                description: _.get(error, 'message', "Tạo danh mục thất bại"),
            });
        })
    }
    return (
        <>
            <Form form={form} onFinish={onFinish}>
                <SuccessModal
                    title="Thành công"
                    content="Tạo danh mục thành công"
                    onSuccess={() => history.push({ pathname: slugs.articles, state: { tabActive: '1' } })}
                    visible={openSuccessModal}
                />
                <div>
                    <Row justify="space-between" style={{ marginBottom: 24 }}>
                        <Title level={3}>Tạo mới danh mục</Title>
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
                                                    name="name"
                                                    className={styles.formItem}
                                                >
                                                    <Input
                                                        allowClear
                                                        placeholder="Họ và tên"
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
                                                    name="code"
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

export default ArticlesCreate