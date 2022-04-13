import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Col } from 'antd';

import { FunnelPlotOutlined } from '@ant-design/icons';
import { CatalogsProduct, StatusProduct } from '../constant/dummyData';

const { SubMenu } = Menu;

const FilterProducts = ({ filter, setFilter }) => {

    return (
        <Col>
            <Menu
                style={{ width: 250 }}
                // defaultSelectedKeys={['1']}
                // defaultOpenKeys={['sub1']}
                mode='inline'
                theme='light'
            >
                <SubMenu key="filter" icon={<FunnelPlotOutlined />} title="Lọc sản phẩm">
                    <SubMenu key="catalogs-product" title="Loại sản phẩm">
                        {
                            _.map(CatalogsProduct, (item, key) => <Menu.Item key={key}>{_.get(item, 'name')}</Menu.Item>)
                        }
                    </SubMenu>

                    <SubMenu key="status-product" title="Trạng thái sản phẩm">
                        {
                            _.map(StatusProduct, (item, key) => <Menu.Item key={key}>{_.get(item, 'name')}</Menu.Item>)
                        }
                    </SubMenu>
                </SubMenu>
            </Menu>
        </Col>
    )
}

FilterProducts.propTypes = {
    filter: PropTypes.objectOf,
    setFilter: PropTypes.func
};

FilterProducts.defaultProps = {
    filter: {}
};

export default FilterProducts
