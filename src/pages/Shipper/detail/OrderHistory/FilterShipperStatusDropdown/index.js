import React, { useState } from 'react'
import './style.scss';
import { Menu, Checkbox } from 'antd';
import { FunnelPlotOutlined } from "@ant-design/icons";
import _ from 'lodash';

const { SubMenu } = Menu;

const FilterDropdown = ({ field, dataList, setData, data }) => {
    const [openKeys, setOpenKeys] = useState([""])
    const onChange = (value) => {
        if (field) {
            setData((prev) => ({ ...prev, [field]: value }));
            return;
        }

        setData(value);
    }

    const renderSubmenu = () => {
        return (
            <SubMenu
                key="sub1"
                icon={<FunnelPlotOutlined />}
                title={"Bộ lọc trạng thái"}
                className="customFilter"
            >
                <Checkbox.Group
                    onChange={onChange}
                    value={data}
                >
                    {_.map(dataList ?? [], (item, key) => (
                        <Checkbox key={key} className="custom-item" value={item.code}>
                            {_.get(item, "name")}
                        </Checkbox>
                    ))}
                </Checkbox.Group>
            </SubMenu>
        )
    }

    return (
        <div className="filterDropdown">
            <Menu
                mode="inline"
                style={{
                    border: "none",
                    width: "300px",
                }}
                className="customFilter"
                openKeys={openKeys}
                onMouseLeave={(e) => {
                    let temp = _.cloneDeep(openKeys);
                    setOpenKeys(_.filter(temp, item => item !== "sub1"))
                }}
                onOpenChange={(keys) => setOpenKeys(keys)}
            >
                {renderSubmenu()}
            </Menu>
        </div>
    )
}

export default FilterDropdown;