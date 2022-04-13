import { FunnelPlotOutlined } from "@ant-design/icons";
import { Checkbox, Menu, Form, DatePicker, Button } from "antd";
import _ from "lodash";
import React, { useState } from "react";
import "./style.scss";
import { useGetListStatusList } from '../../hooks';
import moment from "moment";

const { RangePicker } = DatePicker;
const { SubMenu } = Menu;

const Filter = ({
    onChange,
    filterData
}) => {
    const [form] = Form.useForm();
    const [openKeys, setOpenKeys] = useState([""]);
    
    const data = useGetListStatusList();

    const resetValue = () => {
        onChange("STATUS", []);
        onChange("TYPE", []);
        onChange("TIME", [moment().startOf('day'), moment().endOf('day')]);
    }

    const renderSubmenu = () => {
        return (
            <SubMenu
                key="sub1"
                icon={<FunnelPlotOutlined />}
                title="Bộ lọc"
                className="customFilter"
            >
                <SubMenu title="Thời gian">
                    <RangePicker format={"DD/MM/YYYY HH:mm"} allowClear={false} showTime={true} style={{ borderRadius: "6px", width: '90%', margin: '0px 23px' }} value={filterData.dateTime} onChange={(value) => onChange("TIME", value)} />
                </SubMenu>

                <SubMenu title="Trạng thái">
                    <Checkbox.Group
                        onChange={(value) => onChange("STATUS", value)}
                        value={filterData.status || []}
                    >
                        {_.map(data, (item, key) => (
                            <Checkbox key={key} className="custom-item" value={item.id}>
                                {_.get(item, "name")}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                </SubMenu>
                <SubMenu title="Loại">
                    <Checkbox.Group
                        onChange={(value) => onChange("TYPE", value)}
                        value={filterData.type || []}
                    >
                        <Checkbox className="custom-item" value="OUT">
                            Xuất
                        </Checkbox>
                        <Checkbox className="custom-item" value="IN">
                            Nhập
                        </Checkbox>
                    </Checkbox.Group>
                
                </SubMenu>
                <div className={"buttonContainer"}>
                    <Button onClick={resetValue} className="buttonReset">Thiết lập lại</Button>
                </div>
              
            </SubMenu>
        )

    };

    const onOpenChange = keys => {
        setOpenKeys(keys)
    };

    return (
        <div className="filterDropdown">
            <Menu
                style={{
                    position: "absolute",
                    zIndex: "10",
                    border: "none",
                }}
                mode="inline"
                className="custom-filter"
                openKeys={openKeys}
                onMouseLeave={(e) => {
                    let temp = _.cloneDeep(openKeys);
                    setOpenKeys(_.filter(temp, item => item !== "sub1"))
                }}
                onOpenChange={onOpenChange}
            >
                {renderSubmenu()}
            </Menu>
        </div>
    );
};

export default Filter;
