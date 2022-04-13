import { FunnelPlotOutlined } from "@ant-design/icons";
import { Checkbox, Menu, Select, Form, DatePicker, Space } from "antd";
import _ from "lodash";
import moment from "moment";
import React, { useState, useEffect, Fragment, useMemo } from "react";
import {
  useGetDistricts,
  useGetProvinces,
  useGetWards,
} from "../../graphql/schemas/masterdata/address/query";
import "./style.scss";

const { SubMenu } = Menu;

const FilterDropdown = ({
  filterItems,
  onChange,
  title,
  isFilterArea,
  setFilterDistrict,
  setFilterWard,
  setFilterProvince,
  setWardList,
  wardList,
  setSearchTime = undefined,
  searchTime = undefined,
  filterByStatus,
  filterByType,
  pagename,
  setPageSize,
  pageSize,
  setPageIndex,
  flashSale,
  filterProvince,
  setRowSelection
}) => {
  const [form] = Form.useForm();
  const provinces = useGetProvinces();
  const [selectedProvinceId, setSelectedProvinceId] = useState(_.get(_.head(provinces), 'id'));
  const [selectedDistrictId, setSelectedDistrictId] = useState();
  const [selectedWards, setSelectedWards] = useState([]);
  const districts = useGetDistricts({ provinceId: selectedProvinceId });
  const wards = useGetWards({ districtId: selectedDistrictId });
  const [openKeys, setOpenKeys] = useState([""]);

  const { Option } = Select;

  const handleFilterOrder = (groupName, checkedValue) => {
    if (setRowSelection) {
      setRowSelection([]);
    }
    onChange({ group: groupName, checkedValue: checkedValue });
  };

  const handleFormValuesChange = (changedValues) => {
    const formFieldName = Object.keys(changedValues)[0];
    setPageIndex(1);
    setPageSize(20);
    if (setRowSelection) {
      setRowSelection([]);
    }
    if (pagename) {
      localStorage.setItem('paging', JSON.stringify({ pagename: pagename, pageIndex: 1, pageSize: pageSize || 20 }));
    }

    if (formFieldName === "province") {
      setSelectedProvinceId(changedValues[formFieldName]);
      setSelectedDistrictId(undefined);
      form.setFieldsValue({ district: null, ward: [] });
      window.localStorage.setItem('selectedProvinceId', changedValues[formFieldName]);
      if (window.localStorage.getItem('selectedDistrictId')) {
        window.localStorage.removeItem('selectedDistrictId')
      }
      if (window.localStorage.getItem('selectedWard')) {
        window.localStorage.removeItem('selectedWard')
      }

      if (changedValues[formFieldName] === undefined) {
        window.localStorage.removeItem('selectedProvinceId')
      }

      setFilterDistrict(undefined);
    }
    if (formFieldName === "district") {
      setSelectedDistrictId(changedValues[formFieldName]);
      setFilterDistrict(changedValues[formFieldName]);
      form.setFieldsValue({ ward: [] });
      setFilterWard(undefined);
      if (window.localStorage.getItem('selectedWard')) {
        window.localStorage.removeItem('selectedWard');
      }
      if (changedValues[formFieldName] !== undefined) {
        window.localStorage.setItem('selectedDistrictId', changedValues[formFieldName]);
      } else {
        window.localStorage.removeItem('selectedDistrictId');
      }
    }
    if (formFieldName === "ward") {
      let tmp = [];
      _.map(changedValues[formFieldName], (item) => tmp.push(_.find(wards, ['id', item])));
      window.localStorage.setItem('selectedWard', JSON.stringify(tmp));
      setFilterWard(tmp);
    }
  };

  useEffect(() => {
    if (setWardList) {
      setWardList(wards)
    }
  }, [wards]);

  useEffect(() => {
    setFilterProvince && setFilterProvince(selectedProvinceId)
  }, [selectedProvinceId])

  useEffect(() => {
    if (window.localStorage.getItem('selectedProvinceId')) {
      setSelectedProvinceId(window.localStorage.getItem('selectedProvinceId'))
    } else {
      setSelectedProvinceId(_.get(_.head(provinces), 'id'));
    }
    if (window.localStorage.getItem('selectedDistrictId')) {
      setSelectedDistrictId(window.localStorage.getItem('selectedDistrictId'));
    }
    if (window.localStorage.getItem('selectedWard')) {
      setFilterWard(JSON.parse(window.localStorage.getItem('selectedWard')));
      setSelectedWards(JSON.parse(window.localStorage.getItem('selectedWard')));
    }
    if (window.localStorage.getItem('startDate')) {
      setSearchTime((prev) => ({ ...prev, startDate: moment(window.localStorage.getItem('startDate')) }));
    }
    if (window.localStorage.getItem('endDate')) {
      setSearchTime((prev) => ({ ...prev, startDate: moment(window.localStorage.getItem('endDate')) }));
    }

  }, [provinces])

  useMemo(() => {
    if (provinces) {
      setSelectedProvinceId(_.get(_.head(provinces), 'id'));
    }
  }, [provinces]);

  const handleChange = (value, isStart) => {
    if (!_.isNull(value) && isStart) {
      window.localStorage.setItem('startDate', moment(_.get(value, '_d')));
      setSearchTime((prev) => ({ ...prev, startDate: !_.isNull(value) ? moment(_.get(value, '_d')) : undefined }));
    }
    if (_.isNull(value) && isStart) {
      window.localStorage.removeItem('startDate');
      setSearchTime((prev) => ({ ...prev, startDate: !_.isNull(value) ? moment(_.get(value, '_d')) : undefined }));
    }

    if (!_.isNull(value) && !isStart) {
      window.localStorage.setItem('endDate', moment(_.get(value, '_d')));
      setSearchTime((prev) => ({ ...prev, endDate: !_.isNull(value) ? moment(_.get(value, '_d')) : undefined }));
    }

    if (_.isNull(value) && !isStart) {
      window.localStorage.removeItem('endDate');
      setSearchTime((prev) => ({ ...prev, endDate: !_.isNull(value) ? moment(_.get(value, '_d')) : undefined }));
    }


  }

  if (flashSale) {
    return <div className="filter-dropdown">
      <Menu
        style={{
          position: "absolute",
          zIndex: "10",
          border: "none",
        }}
        mode="inline"
        multiple
        className="custom-filter"
        openKeys="sub1"
      >
        <SubMenu
          key="sub1"
          icon={<FunnelPlotOutlined />}
          title={title}
          className="custom-filter"
        >
          {
            _.map(filterItems, (item, key) => {
              return <Checkbox.Group
                onChange={(value) => handleFilterOrder(item.group.code, value)}
                key={key}
                value={filterByType || []}
              >
                {_.map(item.filterList, (item, key) => (
                  <Checkbox key={key} className="custom-item" value={item.id}>
                    {_.get(item, "name")}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            })
          }
        </SubMenu>

      </Menu>
    </div>

  }

  const onOpenChange = keys => {
    setOpenKeys(keys)
  };



  return (
    <div className="filter-dropdown">
      <Menu
        onMouseLeave={(e) => {
          let temp = _.cloneDeep(openKeys);
          setOpenKeys(_.filter(temp, item => item !== "sub1"))
        }}
        onOpenChange={onOpenChange}
        style={{
          position: "absolute",
          zIndex: "10",
          border: "none",
        }}
        mode="inline"
        multiple
        openKeys={openKeys}
        className="custom-filter"
      >
        <SubMenu
          key="sub1"
          icon={<FunnelPlotOutlined />}
          title={title}
          className="custom-filter"
        >
          {_.map(filterItems, (item, key) => {
            if (item.group.code === "TIME") {
              return (
                <SubMenu key={key} title={item.group.name}>
                  <div style={{ padding: '10px 18px', background: 'unset' }} className="flex w-max">
                    <DatePicker
                      value={searchTime.startDate}
                      onChange={(value) => handleChange(value, true)}
                      style={{ borderRadius: 6, width: '40%', margin: 5 }}
                      placeholder="Ngày bắt đầu"
                    />
                    <DatePicker
                      value={searchTime.endDate}
                      onChange={(value) => handleChange(value, false)}
                      style={{ borderRadius: 6, width: '40%', margin: 5 }}
                      placeholder="Ngày kết thúc"
                    />
                  </div>
                </SubMenu>
              )
            }

            if (item.group.code === "TYPE") {
              return (
                <SubMenu key={key} title={item.group.name}>
                  <Checkbox.Group
                    onChange={(value) => handleFilterOrder(item.group.code, value)}
                    key={key}
                    value={filterByType || []}
                  >
                    {_.map(item.filterList, (item, key) => (
                      <Checkbox key={key} className="custom-item" value={item.id}>
                        {_.get(item, "name")}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                </SubMenu>
              )
            }

            return (
              <SubMenu key={key} title={item.group.name}>
                <Checkbox.Group
                  onChange={(value) => handleFilterOrder(item.group.code, value)}
                  key={key}
                  value={filterByStatus || []}
                >
                  {_.map(item.filterList, (item, key) => (
                    <Checkbox key={key} className="custom-item" value={item.id}>
                      {_.get(item, "name")}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </SubMenu>
            )
          })}

          {isFilterArea && (
            <SubMenu
              title="Lọc theo khu vực"
              className="filter-province"
              key="sub-2"
            >
              <Form
                onValuesChange={handleFormValuesChange}
                form={form}
                style={{ padding: "0 18px 0 23px" }}
              >
                <Form.Item name="province">
                  <Select
                    showSearch
                    className="filter-province"
                    placeholder="Chọn thành phố/ tỉnh"
                    allowClear
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    defaultValue={selectedProvinceId}
                  //defaultActiveFirstOption
                  >
                    {provinces?.map((province) => (
                      <Option value={province.id} key={province.id}>
                        {province.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="district">
                  <Select
                    showSearch
                    className="filter-province"
                    placeholder="Chọn quận/ huyện"
                    disabled={_.isEmpty(selectedProvinceId)}
                    defaultValue={selectedDistrictId}
                    allowClear
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {districts?.map((dis) => (
                      <Option key={dis.id} value={dis.id}>
                        {dis.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="ward">
                  <Select
                    className="filter-province"
                    placeholder="Chọn phường/ xã"
                    disabled={_.isEmpty(selectedDistrictId)}
                    mode="multiple"
                    allowClear
                    defaultValue={_.map(selectedWards, (item) => item.id)}
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {wards?.map((ward) => (
                      <Option key={ward.id} value={ward.id}>
                        {ward.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

              </Form>
            </SubMenu>
          )}
        </SubMenu>
      </Menu>
    </div>
  );
};

export default FilterDropdown;
