import { Row, Typography, Col, Space, Button } from 'antd';
import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Wrapper from '../../../../components/Wrapper/Wrapper';

import _ from 'lodash'
import { useGetCategories } from '../hooks';
import slugs from '../../../../constant/slugs';
import styles from './styles.module.scss';

import clsx from 'clsx';

const { Title, Text } = Typography;

const ArticlesCategoryDetail = () => {
    const { id } = useParams();
    const { data } = useGetCategories({ filter: { id: { eq: id } } });

    const history = useHistory();

    return (
        <>
            <div>
                <Row justify="space-between" style={{ marginBottom: 24 }}>
                    <Title level={3}>Chi tiết danh mục</Title>
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
                                            {_.get(data, 'data[0].attributes.code', '-')}
                                        </Col>
                                    </Row>
                                    <Row align="middle">
                                        <Col xs={8}>
                                            <Text className="input-label">
                                                Tên danh mục <span style={{ color: "red" }}>*</span>
                                            </Text>
                                        </Col>
                                        <Col xs={16}>
                                            {_.get(data, 'data[0].attributes.name', '-')}
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
                            onClick={() => history.push('/article/category/edit/' + id)}
                            className={clsx(styles.editBtn, styles.button)}
                        >
                            Sửa thông tin
                        </Button>
                    </Space>
                </Row>
            </div>

        </>
    )
}

export default ArticlesCategoryDetail