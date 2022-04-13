import { FunnelPlotOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { Checkbox, Menu, Select, Form, DatePicker, Space } from "antd";
import _ from "lodash";
import moment from "moment";
import React, { useState, useEffect, Fragment, useMemo } from "react";
import { EXPORT_REPORT, SELL_REPORT } from "../../constant/info";
import { GET_LIST_BOOTHS_FILTER } from "../../graphql/schemas/booths/query";
import {
  useGetCategories,
  useGetProductStatus,
} from "../../graphql/schemas/hook";
import {
  useGetDistricts,
  useGetProvinces,
  useGetWards,
} from "../../graphql/schemas/masterdata/address/query";
import { GET_ALL_ORDER_STATUS } from "../../graphql/schemas/order/query";
import "./style.scss";

const { RangePicker } = DatePicker;
const { SubMenu } = Menu;

const ExportReportFilter = ({
  onChange,
  setPageIndex,
  onBoothChange,
  filterByOrderStatus,
  filterByProductStatus,
  filterByCategory,
  filterByDate,
  type,
}) => {
  const [form] = Form.useForm();

  const [collapsed, setCollapsed] = useState(false);

  const {
    data: productStatus,
    loading: loadingStatus,
    error: errorStatus,
  } = useGetProductStatus();
  const [openKeys, setOpenKeys] = useState([""]);
  const { data: orderStatus } = useQuery(GET_ALL_ORDER_STATUS, {});

  const { data: booths } = useQuery(GET_LIST_BOOTHS_FILTER, {});

  const { data: categoryList, loading: loadingCategory } = useGetCategories();

  const { Option } = Select;

  const handleFilterOrder = (groupName, checkedValue) => {
    onChange({ group: groupName, checkedValue: checkedValue });
  };

  const [filteredDate, setFilteredDate] = useState(filterByDate ?? []);

  const onBoothSelected = (booth) => {
    onBoothChange(booth);
    setPageIndex && setPageIndex(1);
  };

  const onBoothSearchChange = (booth) => {
    console.log("Booth search: ", booth);
  };

  const renderSubmenu = () => {
    switch (type) {
      case SELL_REPORT:
        return (
          <SubMenu

            key="sub1"
            icon={<FunnelPlotOutlined />}
            title="Bộ lọc"
            className="custom-filter"
          >
            <SubMenu title="Kho hàng lưu động">
              <Select
                style={{ width: "95%", margin: "0px 10px 0px 10px" }}
                showSearch
                placeholder=""
                optionFilterProp="children"
                onChange={onBoothSelected}
                onSearch={onBoothSearchChange}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {_.map(booths?.results ?? [], (item, key) => {
                  return (
                    <Option key={key} value={item.id}>
                      {item.code}
                    </Option>
                  );
                })}
              </Select>
            </SubMenu>
            <SubMenu title="Trạng thái đơn hàng">
              <Checkbox.Group
                onChange={(value) => handleFilterOrder("ORDER_STATUS", value)}
                value={filterByOrderStatus || []}
              >
                {_.map(_.get(orderStatus, "order_status", []), (item, key) => (
                  <Checkbox key={key} className="custom-item" value={item.id}>
                    {_.get(item, "name")}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </SubMenu>
          </SubMenu>
        );
        break;
      case EXPORT_REPORT:
        return (
          <SubMenu
            key="sub1"
            icon={<FunnelPlotOutlined />}
            title="Bộ lọc"
            className="custom-filter"
          >
            {/* <SubMenu title="Thời gian" key={1}>
                        <div style={{ padding: '10px 18px', background: 'unset' }} className="flex w-max">
                            <RangePicker format="DD/MM/YYYY HH:mm" onChange={(v) => { onDateChange(v); setFilteredDate(v) }} value={filteredDate} style={{ borderRadius: 6, height: 38 }} showTime />

                        </div>
                    </SubMenu> */}
            {/* <SubMenu title="Kho hàng lưu động" key={2}>
                        <Select
                            style={{ width: '95%', margin: '0px 10px 0px 10px' }}
                            showSearch
                            placeholder=""
                            optionFilterProp="children"
                            onChange={onBoothSelected}
                            onSearch={onBoothSearchChange}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {_.map(booths?.results ?? [], (item, key) => {
                                return <Option key={key} value={item.id}>{item.code}</Option>
                            })}

                        </Select>
                    </SubMenu>
                    <SubMenu title="Trạng thái đơn hàng" key={3}>
                        <Checkbox.Group
                            onChange={(value) => handleFilterOrder("ORDER_STATUS", value)}
                            value={filterByOrderStatus || []}
                        >
                            {_.map(_.get(orderStatus, 'order_status', []), (item, key) => (
                                <Checkbox key={key} className="custom-item" value={item.id}>
                                    {_.get(item, "name")}
                                </Checkbox>
                            ))}
                        </Checkbox.Group>
                    </SubMenu> */}
            {/* <SubMenu title="Trạng thái sản phẩm" key={4}>
              <Checkbox.Group
                onChange={(value) => handleFilterOrder("PRODUCT_STATUS", value)}
                value={filterByProductStatus || []}
              >
                {_.map(productStatus ?? [], (item, key) => (
                  <Checkbox key={key} className="custom-item" value={item.id}>
                    {_.get(item, "name")}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </SubMenu> */}
            <SubMenu title="Danh mục sản phẩm" key={"5"}>
              <Checkbox.Group
                onChange={(value) => handleFilterOrder("CATEGORY", value)}
                value={filterByCategory || []}
              >
                {_.map(categoryList ?? [], (item, key) => (
                  <Checkbox key={key} className="custom-item" value={item.id}>
                    {_.get(item, "name")}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </SubMenu>
          </SubMenu>
        );

      default:
        break;
    }
  };

  const onOpenChange = keys => {
    setOpenKeys(keys)
  };

  return (
    <div className="filter-dropdown">
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

export default ExportReportFilter;
